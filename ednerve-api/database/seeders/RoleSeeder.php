<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['code' => 'institution_admin', 'name' => 'Institution Administrator', 'description' => 'Manages the institution and its users.'],
            ['code' => 'registrar', 'name' => 'Registrar', 'description' => 'Manages institution-wide academic administration and records.'],
            ['code' => 'dean', 'name' => 'Dean', 'description' => 'Manages an academic faculty or school.'],
            ['code' => 'hod', 'name' => 'Head of Department', 'description' => 'Manages an academic department.'],
            ['code' => 'faculty', 'name' => 'Faculty', 'description' => 'Academic teaching and learning role.'],
            ['code' => 'admissions_officer', 'name' => 'Admissions Officer', 'description' => 'Manages admissions activities.'],
            ['code' => 'examination_officer', 'name' => 'Examination Officer', 'description' => 'Manages examination activities.'],
            ['code' => 'finance_officer', 'name' => 'Finance Officer', 'description' => 'Manages institutional finance activities.'],
            ['code' => 'hr_officer', 'name' => 'HR Officer', 'description' => 'Manages human resources activities.'],
            ['code' => 'librarian', 'name' => 'Librarian', 'description' => 'Manages library services.'],
            ['code' => 'student', 'name' => 'Student', 'description' => 'Student portal and academic activities.'],
            ['code' => 'applicant', 'name' => 'Applicant', 'description' => 'Prospective student applying for admission.'],
            ['code' => 'parent_guardian', 'name' => 'Parent / Guardian', 'description' => 'Parent or guardian access.'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['code' => $role['code']],
                [
                    'name' => $role['name'],
                    'description' => $role['description'],
                    'status' => 'active',
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
