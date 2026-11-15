<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;

class TenantContext
{
    public const SESSION_KEY = 'active_tenant_id';

    public function accessibleTenants(User $user)
    {
        $memberships = $user->tenants()
            ->where('tenants.is_active', true)
            ->wherePivot('membership_status', 'active')
            ->orderBy('tenants.name')
            ->get([
                'tenants.id',
                'tenants.code',
                'tenants.name',
                'tenants.slug',
                'tenants.institution_type',
                'tenants.city',
                'tenants.state',
            ]);

        if ($this->isPlatformAdministrator($user)) {
            return Tenant::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get([
                    'id', 'code', 'name', 'slug',
                    'institution_type', 'city', 'state',
                ]);
        }

        return $memberships;
    }

    public function findAccessibleTenant(User $user, int $tenantId): Tenant
    {
        $tenant = Tenant::query()
            ->whereKey($tenantId)
            ->where('is_active', true)
            ->first();

        if (!$tenant) {
            throw new AuthorizationException('The requested institution is unavailable.');
        }

        if (
            !$this->isPlatformAdministrator($user) &&
            !$user->tenants()
                ->where('tenants.id', $tenantId)
                ->where('tenants.is_active', true)
                ->wherePivot('membership_status', 'active')
                ->exists()
        ) {
            throw new AuthorizationException('You do not have an active membership in this institution.');
        }

        return $tenant;
    }

    public function isPlatformAdministrator(User $user): bool
    {
        return $user->roleAssignments()
            ->whereNull('tenant_id')
            ->whereNull('organization_unit_id')
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->whereHas('role', fn ($query) => $query
                ->where('code', 'platform_admin')
                ->where('is_active', true))
            ->exists();
    }

    /**
     * Resolve context from a validated request header first, then SPA session.
     * A client-supplied ID is never trusted without membership verification.
     */
    public function resolveForRequest(Request $request): ?Tenant
    {
        $user = $request->user();

        if (!$user) {
            return null;
        }

        $requestedId = $request->header('X-Tenant-ID');

        if ($requestedId !== null && $requestedId !== '') {
            if (!ctype_digit((string) $requestedId)) {
                abort(422, 'X-Tenant-ID must be a valid numeric institution ID.');
            }

            $tenant = $this->findAccessibleTenant($user, (int) $requestedId);

            if ($request->hasSession()) {
                $request->session()->put(self::SESSION_KEY, $tenant->id);
            }

            return $tenant;
        }

        if ($request->hasSession()) {
            $sessionTenantId = $request->session()->get(self::SESSION_KEY);

            if ($sessionTenantId) {
                return $this->findAccessibleTenant($user, (int) $sessionTenantId);
            }
        }

        return null;
    }
}
