<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = [
            [
                'code' => 'AMU',
                'name' => 'Aligarh Muslim University',
                'slug' => 'amu',
                'institution_type' => 'university',
                'city' => 'Aligarh',
                'state' => 'Uttar Pradesh',
            ],
            [
                'code' => 'JNU',
                'name' => 'Jawaharlal Nehru University',
                'slug' => 'jnu',
                'institution_type' => 'university',
                'city' => 'New Delhi',
                'state' => 'Delhi',
            ],
            [
                'code' => 'JMI',
                'name' => 'Jamia Millia Islamia',
                'slug' => 'jmi',
                'institution_type' => 'university',
                'city' => 'New Delhi',
                'state' => 'Delhi',
            ],
            [
                'code' => 'JSPM',
                'name' => 'JSPM Group of Institutions',
                'slug' => 'jspm',
                'institution_type' => 'college_group',
                'city' => 'Pune',
                'state' => 'Maharashtra',
            ],
            [
                'code' => 'SPPU',
                'name' => 'Savitribai Phule Pune University',
                'slug' => 'sppu',
                'institution_type' => 'university',
                'city' => 'Pune',
                'state' => 'Maharashtra',
            ],
        ];

        foreach ($tenants as $tenant) {
            DB::table('tenants')->updateOrInsert(
                ['code' => $tenant['code']],
                array_merge($tenant, [
                    'country' => 'India',
                    'status' => 'active',
                    'updated_at' => now(),
                    'created_at' => now(),
                ])
            );
        }
    }
}
