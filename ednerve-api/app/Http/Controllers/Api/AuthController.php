<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate using email and password.
     *
     * Platform users do not belong to a tenant.
     * Institution users must belong to an active tenant.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $email = strtolower(trim($validated['email']));

        // Email is globally unique across the users table.
        $user = User::where('email', $email)
            ->where('status', 'active')
            ->first();

        // Use the same error for unknown email and incorrect password.
        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        /*
         * Validate the account type and tenant association.
         */
        if ($user->account_type === 'platform') {

            // Platform accounts must not be associated with a tenant.
            if ($user->tenant_id !== null) {
                throw ValidationException::withMessages([
                    'email' => ['This account is not configured correctly.'],
                ]);
            }
        } elseif ($user->account_type === 'institution') {

            // Institution accounts must belong to an active tenant.
            if (
                $user->tenant_id === null ||
                !$user->tenant()->where('status', 'active')->exists()
            ) {
                throw ValidationException::withMessages([
                    'email' => ['This institution account is unavailable.'],
                ]);
            }
        } else {
            // Reject unknown account types.
            throw ValidationException::withMessages([
                'email' => ['This account is not configured correctly.'],
            ]);
        }

        // Update last login timestamp.
        $user->last_login_at = now();
        $user->save();

        // Create Sanctum access token.
        $token = $user->createToken(
            $validated['device_name'] ?? 'ednerve-api'
        )->plainTextToken;

        /*
         * Load relationships according to account type.
         */
        if ($user->account_type === 'institution') {
            $user->load([
                'tenant',
                'activeRoleAssignments.role',
                'activeRoleAssignments.organizationUnit',
            ]);
        }

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    /**
     * Return authenticated user details.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if ($user->account_type === 'institution') {

            // Institution accounts must belong to an active tenant.
            if (
                $user->tenant_id === null ||
                !$user->tenant()->where('status', 'active')->exists()
            ) {
                return response()->json([
                    'message' => 'Your institution account is unavailable because the tenant is inactive.',
                ], 403);
            }

            $user->load([
                'tenant',
                'activeRoleAssignments.role',
                'activeRoleAssignments.organizationUnit',
            ]);
        } elseif ($user->account_type === 'platform') {

            // Platform accounts have no tenant or institution roles.
            if ($user->tenant_id !== null) {
                return response()->json([
                    'message' => 'This platform account is not configured correctly.',
                ], 403);
            }

            $user->load('tenant');
        } else {

            return response()->json([
                'message' => 'Invalid account type.',
            ], 403);
        }

        return response()->json([
            'user' => $user,
        ]);
    }

    /**
     * Revoke the current access token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
