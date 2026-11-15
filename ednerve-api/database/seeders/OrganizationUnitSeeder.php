<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrganizationUnitSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = DB::table('tenants')->get();

        foreach ($tenants as $tenant) {
            DB::table('organization_units')->updateOrInsert(
                [
                    'tenant_id' => $tenant->id,
                    'code' => 'CSE',
                ],
                [
                    'parent_id' => null,
                    'name' => 'Computer Science and Engineering',
                    'unit_type' => 'department',
                    'description' => 'Initial sample academic department.',
                    'status' => 'active',
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}