<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizationUnit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrganizationUnitController extends Controller
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
        $units = OrganizationUnit::where(
            'tenant_id',
            $request->user()->tenant_id
        )
        ->with('parent')
        ->orderBy('name')
        ->paginate(50);

        return response()->json($units);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'parent_id' => ['nullable', 'integer'],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('organization_units', 'code')
                    ->where('tenant_id', $tenantId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'unit_type' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ]);

        if (!empty($validated['parent_id'])) {
            $parentExists = OrganizationUnit::where(
                'tenant_id',
                $tenantId
            )->whereKey($validated['parent_id'])->exists();

            abort_unless($parentExists, 422, 'Invalid parent organization unit.');
        }

        $unit = OrganizationUnit::create([
            ...$validated,
            'tenant_id' => $tenantId,
            'status' => $validated['status'] ?? 'active',
        ]);

        return response()->json([
            'message' => 'Organization unit created successfully.',
            'organization_unit' => $unit,
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $unit = OrganizationUnit::where(
            'tenant_id',
            $request->user()->tenant_id
        )
        ->with(['parent', 'children'])
        ->findOrFail($id);

        return response()->json([
            'organization_unit' => $unit,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $this->authorizeAdmin($request);

        $tenantId = $request->user()->tenant_id;

        $unit = OrganizationUnit::where('tenant_id', $tenantId)
            ->findOrFail($id);

        $validated = $request->validate([
            'parent_id' => ['sometimes', 'nullable', 'integer'],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('organization_units', 'code')
                    ->where('tenant_id', $tenantId)
                    ->ignore($unit->id),
            ],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'unit_type' => ['sometimes', 'required', 'string', 'max:50'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ]);

        if (array_key_exists('parent_id', $validated)
            && $validated['parent_id'] !== null) {

            abort_if(
                (int) $validated['parent_id'] === (int) $unit->id,
                422,
                'An organization unit cannot be its own parent.'
            );

            $parent = OrganizationUnit::where('tenant_id', $tenantId)
                ->findOrFail($validated['parent_id']);

            $descendantIds = $this->descendantIds($unit);

            abort_if(
                in_array($parent->id, $descendantIds, true),
                422,
                'An organization unit cannot be moved beneath its descendant.'
            );
        }

        $unit->update($validated);

        return response()->json([
            'message' => 'Organization unit updated successfully.',
            'organization_unit' => $unit->fresh(['parent', 'children']),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $this->authorizeAdmin($request);

        $unit = OrganizationUnit::where(
            'tenant_id',
            $request->user()->tenant_id
        )->findOrFail($id);

        abort_if(
            $unit->children()->exists(),
            422,
            'Remove or reassign child units before deactivating this unit.'
        );

        abort_if(
            $unit->userRoleAssignments()->exists(),
            422,
            'Reassign or deactivate user role assignments before deactivating this unit.'
        );

        $unit->update(['status' => 'inactive']);

        return response()->json([
            'message' => 'Organization unit deactivated successfully.',
        ]);
    }

    private function descendantIds(OrganizationUnit $unit): array
    {
        $ids = [];
        $children = OrganizationUnit::where(
            'tenant_id',
            $unit->tenant_id
        )->where('parent_id', $unit->id)->get();

        foreach ($children as $child) {
            $ids[] = $child->id;
            $ids = array_merge($ids, $this->descendantIds($child));
        }

        return $ids;
    }
}
