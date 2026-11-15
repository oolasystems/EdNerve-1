<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class RolePermissionResolver
{
    /** Return assignments effective for the requested scope. */
    public function effectiveAssignments(User $user, ?int $tenantId = null, ?int $organizationUnitId = null)
    {
        $now = now();

        return $user->roleAssignments()
            ->with(['role.permissions' => fn ($query) => $query->where('permissions.is_active', true)])
            ->where('user_role_assignments.is_active', true)
            ->where(fn (Builder $q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn (Builder $q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now))
            ->whereHas('role', function (Builder $q) use ($tenantId) {
                $q->where('roles.is_active', true)
                    ->where(function (Builder $scope) use ($tenantId) {
                        $scope->whereNull('roles.tenant_id');
                        if ($tenantId !== null) {
                            $scope->orWhere('roles.tenant_id', $tenantId);
                        }
                    });
            })
            ->where(function (Builder $scope) use ($tenantId) {
                $scope->whereNull('user_role_assignments.tenant_id');
                if ($tenantId !== null) {
                    $scope->orWhere('user_role_assignments.tenant_id', $tenantId);
                }
            })
            ->where(function (Builder $scope) use ($organizationUnitId) {
                if ($organizationUnitId === null) {
                    $scope->whereNull('user_role_assignments.organization_unit_id');
                } else {
                    $scope->whereNull('user_role_assignments.organization_unit_id')
                        ->orWhere('user_role_assignments.organization_unit_id', $organizationUnitId);
                }
            })
            ->get();
    }

    /**
     * Return every effective assignment belonging to the selected tenant,
     * including assignments restricted to particular organization units.
     * Intended for context/bootstrap display, not authorization decisions.
     */
    public function effectiveAssignmentsForTenant(User $user, int $tenantId): Collection
    {
        $now = now();

        return $user->roleAssignments()
            ->with([
                'role.permissions' => fn ($query) => $query->where('permissions.is_active', true),
                'organizationUnit',
            ])
            ->where('user_role_assignments.is_active', true)
            ->where(fn (Builder $q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn (Builder $q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now))
            ->whereHas('role', fn (Builder $q) => $q->where('roles.is_active', true)
                ->where(function (Builder $scope) use ($tenantId) {
                    $scope->whereNull('roles.tenant_id')->orWhere('roles.tenant_id', $tenantId);
                }))
            ->where(function (Builder $scope) use ($tenantId) {
                $scope->whereNull('user_role_assignments.tenant_id')
                    ->orWhere('user_role_assignments.tenant_id', $tenantId);
            })
            ->get();
    }

    public function permissionCodes(User $user, ?int $tenantId = null, ?int $organizationUnitId = null): Collection
    {
        return $this->effectiveAssignments($user, $tenantId, $organizationUnitId)
            ->flatMap(fn ($assignment) => $assignment->role?->permissions?->pluck('code') ?? collect())
            ->unique()
            ->values();
    }

    public function hasPermission(User $user, string $permissionCode, ?int $tenantId = null, ?int $organizationUnitId = null): bool
    {
        return $this->effectiveAssignments($user, $tenantId, $organizationUnitId)
            ->contains(fn ($assignment) => $assignment->role?->permissions?->contains('code', $permissionCode) ?? false);
    }

    public function roleCodes(User $user, ?int $tenantId = null, ?int $organizationUnitId = null): Collection
    {
        return $this->effectiveAssignments($user, $tenantId, $organizationUnitId)
            ->pluck('role.code')->filter()->unique()->values();
    }
}
