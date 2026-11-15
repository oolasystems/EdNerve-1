<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            /*
            |--------------------------------------------------------------------------
            | 1. Create Platform Admin (first user)
            |--------------------------------------------------------------------------
            */

            $this->createUser([
                'account_type' => 'platform',
                'tenant_id' => null,
                'name' => 'Platform Administrator',
                'email' => 'platform.admin@ednerve.test',
                'phone' => null,
            ]);

            /*
            |--------------------------------------------------------------------------
            | 2. Institution-wise sample users
            |--------------------------------------------------------------------------
            */

            $institutions = [
                'AMU' => [
                    'admin' => [
                        'name' => 'AMU Institution Admin',
                        'email' => 'admin.amu@ednerve.test',
                        'phone' => '9000000001',
                    ],
                    'registrar' => [
                        'name' => 'AMU Registrar',
                        'email' => 'registrar.amu@ednerve.test',
                        'phone' => '9000000002',
                    ],
                    'faculty' => [
                        'name' => 'AMU Faculty',
                        'email' => 'faculty.amu@ednerve.test',
                        'phone' => '9000000003',
                    ],
                    'student' => [
                        'name' => 'AMU Student',
                        'email' => 'student.amu@ednerve.test',
                        'phone' => '9000000004',
                    ],
                    'admissions' => [
                        'name' => 'AMU Admissions Officer',
                        'email' => 'admissions.amu@ednerve.test',
                        'phone' => '9000000005',
                    ],
                ],

                'JNU' => [
                    'admin' => [
                        'name' => 'JNU Institution Admin',
                        'email' => 'admin.jnu@ednerve.test',
                        'phone' => '9000000011',
                    ],
                    'registrar' => [
                        'name' => 'JNU Registrar',
                        'email' => 'registrar.jnu@ednerve.test',
                        'phone' => '9000000012',
                    ],
                    'faculty' => [
                        'name' => 'JNU Faculty',
                        'email' => 'faculty.jnu@ednerve.test',
                        'phone' => '9000000013',
                    ],
                    'student' => [
                        'name' => 'JNU Student',
                        'email' => 'student.jnu@ednerve.test',
                        'phone' => '9000000014',
                    ],
                    'admissions' => [
                        'name' => 'JNU Admissions Officer',
                        'email' => 'admissions.jnu@ednerve.test',
                        'phone' => '9000000015',
                    ],
                ],

                'JMI' => [
                    'admin' => [
                        'name' => 'JMI Institution Admin',
                        'email' => 'admin.jmi@ednerve.test',
                        'phone' => '9000000021',
                    ],
                    'registrar' => [
                        'name' => 'JMI Registrar',
                        'email' => 'registrar.jmi@ednerve.test',
                        'phone' => '9000000022',
                    ],
                    'faculty' => [
                        'name' => 'JMI Faculty',
                        'email' => 'faculty.jmi@ednerve.test',
                        'phone' => '9000000023',
                    ],
                    'student' => [
                        'name' => 'JMI Student',
                        'email' => 'student.jmi@ednerve.test',
                        'phone' => '9000000024',
                    ],
                    'admissions' => [
                        'name' => 'JMI Admissions Officer',
                        'email' => 'admissions.jmi@ednerve.test',
                        'phone' => '9000000025',
                    ],
                ],

                'JSPM' => [
                    'admin' => [
                        'name' => 'JSPM Institution Admin',
                        'email' => 'admin.jspm@ednerve.test',
                        'phone' => '9000000031',
                    ],
                    'registrar' => [
                        'name' => 'JSPM Registrar',
                        'email' => 'registrar.jspm@ednerve.test',
                        'phone' => '9000000032',
                    ],
                    'faculty' => [
                        'name' => 'JSPM Faculty',
                        'email' => 'faculty.jspm@ednerve.test',
                        'phone' => '9000000033',
                    ],
                    'student' => [
                        'name' => 'JSPM Student',
                        'email' => 'student.jspm@ednerve.test',
                        'phone' => '9000000034',
                    ],
                    'admissions' => [
                        'name' => 'JSPM Admissions Officer',
                        'email' => 'admissions.jspm@ednerve.test',
                        'phone' => '9000000035',
                    ],
                ],

                'SPPU' => [
                    'admin' => [
                        'name' => 'SPPU Institution Admin',
                        'email' => 'admin.sppu@ednerve.test',
                        'phone' => '9000000041',
                    ],
                    'registrar' => [
                        'name' => 'SPPU Registrar',
                        'email' => 'registrar.sppu@ednerve.test',
                        'phone' => '9000000042',
                    ],
                    'faculty' => [
                        'name' => 'SPPU Faculty',
                        'email' => 'faculty.sppu@ednerve.test',
                        'phone' => '9000000043',
                    ],
                    'student' => [
                        'name' => 'SPPU Student',
                        'email' => 'student.sppu@ednerve.test',
                        'phone' => '9000000044',
                    ],
                    'admissions' => [
                        'name' => 'SPPU Admissions Officer',
                        'email' => 'admissions.sppu@ednerve.test',
                        'phone' => '9000000045',
                    ],
                ],
            ];

            /*
            |--------------------------------------------------------------------------
            | 3. Role mapping
            |--------------------------------------------------------------------------
            */

            $roleCodes = [
                'admin' => 'institution_admin',
                'registrar' => 'registrar',
                'faculty' => 'faculty',
                'student' => 'student',
                'admissions' => 'admissions_officer',
            ];

            /*
            |--------------------------------------------------------------------------
            | 4. Create organization units and institution users
            |--------------------------------------------------------------------------
            */

            foreach ($institutions as $tenantCode => $users) {

                $tenant = DB::table('tenants')
                    ->where('code', $tenantCode)
                    ->first();

                if (!$tenant) {
                    throw new RuntimeException(
                        "Tenant not found: {$tenantCode}. Run TenantSeeder first."
                    );
                }

                // Create or retrieve the CSE department for this tenant.
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

                $department = DB::table('organization_units')
                    ->where('tenant_id', $tenant->id)
                    ->where('code', 'CSE')
                    ->first();

                foreach ($users as $userType => $userData) {

                    // Create institution user.
                    $user = $this->createUser([
                        'account_type' => 'institution',
                        'tenant_id' => $tenant->id,
                        'name' => $userData['name'],
                        'email' => $userData['email'],
                        'phone' => $userData['phone'],
                    ]);

                    // Retrieve the corresponding universal role.
                    $roleCode = $roleCodes[$userType];

                    $roleId = DB::table('roles')
                        ->where('code', $roleCode)
                        ->where('status', 'active')
                        ->value('id');

                    if (!$roleId) {
                        throw new RuntimeException(
                            "Role not found or inactive: {$roleCode}. Run RoleSeeder first."
                        );
                    }

                    // Faculty and Student are scoped to the CSE department.
                    // Other roles are institution-wide.
                    $organizationUnitId = in_array(
                        $userType,
                        ['faculty', 'student']
                    ) ? $department->id : null;

                    // Create or update role assignment.
                    DB::table('user_role_assignments')->updateOrInsert(
                        [
                            'tenant_id' => $tenant->id,
                            'user_id' => $user->id,
                            'role_id' => $roleId,
                            'organization_unit_id' => $organizationUnitId,
                        ],
                        [
                            'is_primary' => true,
                            'status' => 'active',
                            'starts_at' => null,
                            'ends_at' => null,
                            'updated_at' => now(),
                            'created_at' => now(),
                        ]
                    );
                }
            }
        });
    }

    /**
     * Create a user or retrieve the existing user by globally unique email.
     * Existing passwords are not reset when the seeder runs again.
     */
    private function createUser(array $data): User
    {
        $user = User::firstOrNew([
            'email' => $data['email'],
        ]);

        $isNewUser = !$user->exists;

        $user->account_type = $data['account_type'];
        $user->tenant_id = $data['tenant_id'];
        $user->name = $data['name'];
        $user->phone = $data['phone'];
        $user->status = 'active';

        if ($isNewUser) {
            $user->password = Hash::make('Password@123');
        }

        $user->save();

        return $user;
    }
}
