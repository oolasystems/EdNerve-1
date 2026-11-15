# OolaEdNerve – Implementation Steps 6–7

## Step 6: Permission catalogue
- `permissions` stores system permission codes, module, display name and active/system flags.
- `role_permission` maps roles to permissions with a unique role/permission pair.
- `PermissionSeeder` creates an initial permission catalogue. It does not automatically grant permissions to roles; those grants should be reviewed and explicitly configured rather than assuming a broad access policy.

## Step 7: Scoped user-role assignments
- `user_role_assignments` links a user and role with optional tenant and organization-unit scope, assignment actor, effective dates and active flag.
- `tenant_id = NULL` is reserved for platform-level assignments (for example, `platform_admin`).
- Tenant and organization scope consistency must be enforced by the service/policy layer when creating assignments. Foreign keys alone cannot ensure that an organization unit belongs to the same tenant as the assignment or that the user has a tenant membership.
- Do not accept `tenant_id`, `organization_unit_id`, or `assigned_by` as trusted values from an untrusted client. Resolve tenant context from the authenticated user's active membership and set the actor from the authenticated principal.
- Role assignment migrations do not seed passwords or demo users. Create those after deciding the demo-account policy and password-reset flow.

## Apply

```powershell
php artisan migrate:status
php artisan migrate --pretend
php artisan migrate
php artisan db:seed --class=PermissionSeeder
php artisan migrate:status
```

The full `php artisan db:seed` also runs the tenant and role seeders. Their `updateOrCreate` behavior makes them repeatable. Do not run `migrate:fresh` or `db:wipe`.

## Verification
Run `database/verification/steps_6_7_verification.sql` in phpMyAdmin. The permission catalogue should contain 35 entries. `role_permission` and `user_role_assignments` are expected to remain empty until explicit grants and accounts are configured.
