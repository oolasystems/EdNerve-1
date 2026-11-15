<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Ensure the authenticated user is an Institution Admin.
     */
    private function authorizeAdmin(Request $request): void
    {
        abort_unless(
            $request->user()->isInstitutionAdmin(),
            403,
            'Institution Administrator access required.'
        );
    }

    /**
     * Return users belonging to the authenticated institution.
     */
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $users = User::where('tenant_id', $tenantId)
            ->with([
                'activeRoleAssignments.role',
                'activeRoleAssignments.organizationUnit',
            ])
            ->orderBy('name')
            ->paginate(20);

        return response()->json($users);
    }

    /**
     * Create a new institution user.
     */
    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],

            // Email must be globally unique across all institutions.
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email'),
            ],

            'phone' => ['nullable', 'string', 'max:30'],

            'password' => ['required', 'string', 'min:8'],

            'status' => [
                'sometimes',
                Rule::in(['active', 'inactive']),
            ],
        ]);

        $user = User::create([
            'account_type' => 'institution',
            'tenant_id' => $tenantId,
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user,
        ], 201);
    }

    /**
     * Return a specific user belonging to the authenticated institution.
     */
    public function show(Request $request, int $id)
    {
        $tenantId = $request->user()->tenant_id;

        $user = User::where('tenant_id', $tenantId)
            ->with([
                'tenant',
                'activeRoleAssignments.role',
                'activeRoleAssignments.organizationUnit',
            ])
            ->findOrFail($id);

        return response()->json([
            'user' => $user,
        ]);
    }

    /**
     * Update an institution user.
     */
    public function update(Request $request, int $id)
    {
        $this->authorizeAdmin($request);

        $tenantId = $request->user()->tenant_id;

        // Never retrieve a user outside the authenticated tenant.
        $user = User::where('tenant_id', $tenantId)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],

            // Global email uniqueness.
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')
                    ->ignore($user->id),
            ],

            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],

            'password' => ['sometimes', 'required', 'string', 'min:8'],

            'status' => [
                'sometimes',
                Rule::in(['active', 'inactive']),
            ],
        ]);

        // Normalize email.
        if (isset($validated['email'])) {
            $validated['email'] = strtolower(trim($validated['email']));
        }

        // Hash password when supplied.
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make(
                $validated['password']
            );
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Deactivate an institution user.
     */
    public function destroy(Request $request, int $id)
    {
        $this->authorizeAdmin($request);

        $tenantId = $request->user()->tenant_id;

        $user = User::where('tenant_id', $tenantId)
            ->findOrFail($id);

        // Prevent an administrator from deactivating their own account.
        abort_if(
            $user->id === $request->user()->id,
            422,
            'You cannot deactivate your own account.'
        );

        $user->update([
            'status' => 'inactive',
        ]);

        // Revoke all API tokens belonging to the deactivated user.
        $user->tokens()->delete();

        return response()->json([
            'message' => 'User deactivated successfully.',
        ]);
    }
}
