# OolaEdNerve – Implementation Steps 1–5

## Included

1. **Tenancy foundation:** retained the existing `tenants` migration, `Tenant` model and five-institution `TenantSeeder` already present in the uploaded project.
2. **Organization foundation:** added `organization_units` with tenant ownership, optional parent hierarchy, tenant-scoped unique codes/slugs and active status.
3. **Role catalogue:** added a system role catalogue and 12 initial roles (`platform_admin`, `institution_admin`, `registrar`, `admissions_officer`, `faculty`, `controller_examinations`, `finance_officer`, `hr_officer`, `student`, `applicant`, `parent_guardian`, `auditor`).
4. **User accounts:** retained Laravel's existing `users` table and added a separate migration for `phone`, `status` and `last_login_at`. The `User` model supports Sanctum tokens and the tenant relationship.
5. **Institutional membership:** added `tenant_user` as a many-to-many membership pivot with membership status and joined date.

## Important design boundary

`users` remain global identities. A user can belong to multiple tenants through `tenant_user`. A role is not stored directly on `users` or `tenant_user`; role assignment is a separate authorization concern and belongs to the subsequent scoped `user_role_assignments` step. Therefore this package seeds the tenant and role catalogues but does not create misleading sample user-to-role assignments or a pretend super-admin account. The one super-admin account and five sample accounts per role should be seeded when scoped role assignments are implemented and can be linked correctly.

`organization_units` is intentionally not pre-populated with guessed faculties, schools or departments. Those structures vary by institution and should be added from confirmed institutional configuration.

## Apply on the Windows/XAMPP development machine

From `C:\xampp\htdocs\EdNerve\ednerve-api`:

```powershell
composer install
php artisan --version
php artisan migrate:status
php artisan migrate --pretend
php artisan migrate
php artisan db:seed
php artisan migrate:status
```

Do not run `migrate:fresh`, `db:wipe`, or delete existing migration records. Take a database backup before applying migrations to a database containing important data.

## SQL verification

Run `database/verification/steps_1_5_verification.sql` in phpMyAdmin or MySQL Workbench after migrations and seeding. The expected seeded counts are **5 tenants** and **12 roles**. `organization_units` and `tenant_user` are expected to be empty at this stage because no institutional hierarchy or user memberships have been supplied yet.

## Sample credentials

No sample user credentials are created in this step. The authorization assignment table has not yet been implemented, so seeding a purported super administrator or role-specific users now would leave their role membership unassigned. Add those accounts alongside the scoped role-assignment implementation in the next authorization step. Use development-only passwords and force a reset before any production use.

## Environment / validation note

The uploaded ZIP did not contain `.env` or `vendor/`. This environment also has no Composer executable or PDO database driver. PHP syntax checks can be run here, but Laravel Artisan migrations, MySQL migration output and live SQL result rows cannot be truthfully reported from this environment. Run the commands above on the XAMPP machine to produce the real migration and SQL results.
