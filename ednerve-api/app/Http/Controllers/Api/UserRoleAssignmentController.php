<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizationUnit;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UserRoleAssignmentController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        abort_unless(
            $request->user()->isInstitutionAdmin(),
            403,
            'Institution Administrator access required.'
        );
    }

    public function index(Request $request)
    {
        $assignments = UserRoleAssignment::where(
            'tenant_id',
            $request->user()->tenant_id
        )
        ->with(['user', 'role', 'organizationUnit'])
        ->orderBy('user_id')
        ->paginate(50);

        return response()->json($assignments);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'user_id' => ['required', 'integer'],
            'role_id' => [
                'required',
                'integer',
                Rule::exists('roles', 'id')->where('status', 'active'),
            ],
            'organization_unit_id' => ['nullable', 'integer'],
            'is_primary' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);

        $user = User::where('tenant_id', $tenantId)
            ->findOrFail($validated['user_id']);

        $role = Role::findOrFail($validated['role_id']);

        if (!empty($validated['organization_unit_id'])) {
            OrganizationUnit::where('tenant_id', $tenantId)
                ->findOrFail($validated['organization_unit_id']);
        }

        $isPrimary = $validated['is_primary'] ?? false;

        $assignment = DB::transaction(function () use (
            $validated,
            $tenantId,
            $user,
            $isPrimary
        ) {
            if ($isPrimary) {
                UserRoleAssignment::where('tenant_id', $tenantId)
                    ->where('user_id', $user->id)
                    ->update(['is_primary' => false]);
            }

            return UserRoleAssignment::create([
                'tenant_id' => $tenantId,
                'user_id' => $user->id,
                'role_id' => $validated['role_id'],
                'organization_unit_id' =>
                    $validated['organization_unit_id'] ?? null,
                'is_primary' => $isPrimary,
                'status' => $validated['status'] ?? 'active',
                'starts_at' => $validated['starts_at'] ?? null,
                'ends_at' => $validated['ends_at'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Role assigned successfully.',
            'assignment' => $assignment->load([
                'user', 'role', 'organizationUnit'
            ]),
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $assignment = UserRoleAssignment::where(
            'tenant_id',
            $request->user()->tenant_id
        )
        ->with(['user', 'role', 'organizationUnit'])
        ->findOrFail($id);

        return response()->json([
            'assignment' => $assignment,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $this->authorizeAdmin($request);

        $tenantId = $request->user()->tenant_id;

        $assignment = UserRoleAssignment::where(
            'tenant_id',
            $tenantId
        )->findOrFail($id);

        $validated = $request->validate([
            'role_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('roles', 'id')->where('status', 'active'),
            ],
            'organization_unit_id' => ['sometimes', 'nullable', 'integer'],
            'is_primary' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
            'starts_at' => ['sometimes', 'nullable', 'date'],
            'ends_at' => [
                'sometimes',
                'nullable',
                'date',
                'after_or_equal:starts_at',
            ],
        ]);

        if (!empty($validated['organization_unit_id'])) {
            OrganizationUnit::where('tenant_id', $tenantId)
                ->findOrFail($validated['organization_unit_id']);
        }

        DB::transaction(function () use (
            $assignment,
            $validated,
            $tenantId
        ) {
            if ($validated['is_primary'] ?? false) {
                UserRoleAssignment::where('tenant_id', $tenantId)
                    ->where('user_id', $assignment->user_id)
                    ->where('id', '!=', $assignment->id)
                    ->update(['is_primary' => false]);
            }

            $assignment->update($validated);
        });

        return response()->json([
            'message' => 'Role assignment updated successfully.',
            'assignment' => $assignment->fresh([
                'user', 'role', 'organizationUnit'
            ]),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $this->authorizeAdmin($request);

        $assignment = UserRoleAssignment::where(
            'tenant_id',
            $request->user()->tenant_id
        )->findOrFail($id);

        $assignment->update([
            'status' => 'inactive',
            'is_primary' => false,
        ]);

        return response()->json([
            'message' => 'Role assignment deactivated successfully.',
        ]);
    }
}
