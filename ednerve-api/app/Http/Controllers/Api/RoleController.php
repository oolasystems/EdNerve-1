<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::where('status', 'active')
            ->orderBy('name')
            ->get();

        return response()->json([
            'roles' => $roles,
        ]);
    }

    public function show(Role $role)
    {
        abort_unless($role->status === 'active', 404);

        return response()->json([
            'role' => $role,
        ]);
    }
}
