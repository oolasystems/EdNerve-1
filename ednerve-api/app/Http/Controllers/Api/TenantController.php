<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TenantController extends Controller
{
    public function dashboard(Request $request)
    {
        // Total institution statistics
        $totalInstitutions = Tenant::count();

        $activeInstitutions = Tenant::where('status', 'active')->count();

        $inactiveInstitutions = Tenant::where('status', 'inactive')->count();

        // Institution user statistics
        $totalInstitutionUsers = User::where(
            'account_type',
            'institution'
        )->count();

        $activeInstitutionUsers = User::where('account_type', 'institution')
            ->where('status', 'active')
            ->count();

        // Institution distribution by type
        $institutionsByType = Tenant::query()
            ->selectRaw('institution_type as type, COUNT(*) as total')
            ->groupBy('institution_type')
            ->orderBy('institution_type')
            ->get();

        // Institution distribution by status
        $institutionsByStatus = Tenant::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->orderBy('status')
            ->get();

        return response()->json(
            [
                'summary' => [
                    'total_institutions' => $totalInstitutions,
                    'active_institutions' => $activeInstitutions,
                    'inactive_institutions' => $inactiveInstitutions,
                    'total_institution_users' => $totalInstitutionUsers,
                    'active_institution_users' => $activeInstitutionUsers,
                ],

                'institution_statistics' => [
                    'by_type' => $institutionsByType,
                    'by_status' => $institutionsByStatus,
                ],

                // Will be connected to actual audit/activity records later.
                'recent_activities' => [],
            ],
            200
        );
    }

    /**
     * Ensure the authenticated user is a Platform Admin.
     */
    private function authorizePlatformAdmin(Request $request): void
    {
        abort_unless(
            $request->user()->isPlatformAdmin(),
            403,
            'Platform Admin access required.'
        );
    }

    /**
     * Return a paginated list of all tenants.
     * Platform Admin only.
     */
    public function index(Request $request)
    {
        $this->authorizePlatformAdmin($request);

        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'institution_type' => ['nullable', 'string', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'sort_by' => [
                'sometimes',
                Rule::in(['name', 'code', 'created_at']),
            ],
            'sort_order' => [
                'sometimes',
                Rule::in(['asc', 'desc']),
            ],
        ]);

        $query = Tenant::query()
            ->withCount([
                'users',
                'users as active_users_count' => function ($query) {
                    $query->where('status', 'active');
                },
                'organizationUnits',
            ]);

        if (!empty($validated['search'])) {
            $search = $validated['search'];

            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['institution_type'])) {
            $query->where(
                'institution_type',
                $validated['institution_type']
            );
        }

        $sortBy = $validated['sort_by'] ?? 'name';
        $sortOrder = $validated['sort_order'] ?? 'asc';
        $perPage = $validated['per_page'] ?? 20;

        $tenants = $query
            ->orderBy($sortBy, $sortOrder)
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($tenants);
    }

    /**
     * Return details of a specific tenant.
     * Platform Admin only.
     */
    public function show(Request $request, int $id)
    {
        $user = $request->user();

        // Institution users can view only their own tenant.
        if ($user->isInstitutionUser()) {
            $tenant = $user->tenant()
                ->where('status', 'active')
                ->firstOrFail();

            return response()->json([
                'tenant' => $tenant,
            ]);
        }

        // Platform Admin can view any tenant.
        $this->authorizePlatformAdmin($request);

        $tenant = Tenant::withCount([
            'users',
            'users as active_users_count' => function ($query) {
                $query->where('status', 'active');
            },
            'users as inactive_users_count' => function ($query) {
                $query->where('status', 'inactive');
            },
            'organizationUnits',
        ])->findOrFail($id);

        $tenantAdmin = User::where('tenant_id', $tenant->id)
            ->whereHas('activeRoleAssignments', function ($query) {
                $query->whereHas('role', function ($roleQuery) {
                    $roleQuery->where('code', 'institution_admin');
                });
            })
            ->orderBy('id')
            ->first([
                'id',
                'name',
                'email',
                'phone',
                'status',
            ]);

        return response()->json([
            'tenant' => $tenant,
            'tenant_admin' => $tenantAdmin,
        ]);
    }

    /**
     * Create a tenant and its first Tenant Admin.
     * Platform Admin only.
     */
    public function store(Request $request)
    {
        $this->authorizePlatformAdmin($request);

        $validated = $request->validate([
            'tenant' => ['required', 'array'],
            'tenant.code' => [
                'required',
                'string',
                'max:50',
                'regex:/^[A-Za-z0-9_-]+$/',
                Rule::unique('tenants', 'code'),
            ],
            'tenant.name' => ['required', 'string', 'max:255'],
            'tenant.slug' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('tenants', 'slug'),
            ],
            'tenant.institution_type' => [
                'required',
                'string',
                'max:100',
            ],
            'tenant.email' => ['nullable', 'email', 'max:255'],
            'tenant.phone' => ['nullable', 'string', 'max:30'],
            'tenant.website' => ['nullable', 'url', 'max:255'],
            'tenant.address' => ['nullable', 'string', 'max:1000'],
            'tenant.city' => ['nullable', 'string', 'max:100'],
            'tenant.state' => ['nullable', 'string', 'max:100'],
            'tenant.country' => ['required', 'string', 'max:100'],

            'initial_admin' => ['required', 'array'],
            'initial_admin.name' => [
                'required',
                'string',
                'max:255',
            ],
            'initial_admin.email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ],
            'initial_admin.phone' => [
                'nullable',
                'string',
                'max:30',
            ],
            'initial_admin.password' => [
                'required',
                'string',
                'min:8',
            ],
        ]);

        $tenantData = $validated['tenant'];
        $adminData = $validated['initial_admin'];

        $tenantData['code'] = strtoupper(trim($tenantData['code']));
        $tenantData['slug'] = strtolower(trim($tenantData['slug']));

        $adminData['email'] = strtolower(trim($adminData['email']));

        $result = DB::transaction(function () use (
            $tenantData,
            $adminData
        ) {
            $tenant = Tenant::create([
                ...$tenantData,
                'status' => 'active',
            ]);

            $tenantAdmin = User::create([
                'account_type' => 'institution',
                'tenant_id' => $tenant->id,
                'name' => $adminData['name'],
                'email' => $adminData['email'],
                'phone' => $adminData['phone'] ?? null,
                'password' => Hash::make($adminData['password']),
                'status' => 'active',
            ]);

            $adminRole = \App\Models\Role::where(
                'code',
                'institution_admin'
            )
                ->where('status', 'active')
                ->firstOrFail();

            $tenantAdmin->roleAssignments()->create([
                'tenant_id' => $tenant->id,
                'role_id' => $adminRole->id,
                'organization_unit_id' => null,
                'is_primary' => true,
                'status' => 'active',
                'starts_at' => now()->toDateString(),
                'ends_at' => null,
            ]);

            return [
                'tenant' => $tenant,
                'tenant_admin' => $tenantAdmin,
            ];
        });

        return response()->json([
            'message' => 'Tenant created successfully.',
            'tenant' => $result['tenant'],
            'tenant_admin' => [
                'id' => $result['tenant_admin']->id,
                'name' => $result['tenant_admin']->name,
                'email' => $result['tenant_admin']->email,
                'phone' => $result['tenant_admin']->phone,
                'account_type' => $result['tenant_admin']->account_type,
                'tenant_id' => $result['tenant_admin']->tenant_id,
                'role' => 'institution_admin',
            ],
        ], 201);
    }

    /**
     * Update tenant details.
     * Platform Admin only.
     */
    public function update(Request $request, int $id)
    {
        $this->authorizePlatformAdmin($request);

        $tenant = Tenant::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'institution_type' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'website' => ['sometimes', 'nullable', 'url', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'state' => ['sometimes', 'nullable', 'string', 'max:100'],
            'country' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
        ]);

        $tenant->update($validated);

        return response()->json([
            'message' => 'Tenant updated successfully.',
            'tenant' => $tenant->fresh(),
        ]);
    }

    /**
     * Activate or deactivate a tenant.
     * Platform Admin only.
     */
    public function updateStatus(Request $request, int $id)
    {
        $this->authorizePlatformAdmin($request);

        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in(['active', 'inactive']),
            ],
        ]);

        $tenant = Tenant::findOrFail($id);

        $tenant->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Tenant status updated successfully.',
            'tenant' => $tenant->fresh(),
        ]);
    }
}
