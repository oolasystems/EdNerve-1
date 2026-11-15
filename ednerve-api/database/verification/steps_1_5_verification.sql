-- OolaEdNerve: verification queries for implementation Steps 1-5.
-- Run these in the ednerve database after `php artisan migrate` and `php artisan db:seed`.

-- 1. Confirm that all five foundation tables exist.
SHOW TABLES LIKE 'tenants';
SHOW TABLES LIKE 'organization_units';
SHOW TABLES LIKE 'roles';
SHOW TABLES LIKE 'users';
SHOW TABLES LIKE 'tenant_user';

-- 2. Verify the five demo institution records seeded by TenantSeeder.
SELECT id, code, name, institution_type, city, state, country, timezone, is_active
FROM tenants
ORDER BY id;

-- Expected count after TenantSeeder: 5.
SELECT COUNT(*) AS tenant_count FROM tenants;

-- 3. Verify the system role catalogue seeded by RoleSeeder.
SELECT id, code, name, scope_type, tenant_id, is_system, is_active
FROM roles
ORDER BY id;

-- Expected count after RoleSeeder: 12.
SELECT COUNT(*) AS role_count FROM roles;

-- 4. Verify the new user-account columns.
SHOW COLUMNS FROM users;

-- 5. Verify tenant membership table structure and current membership count.
SHOW COLUMNS FROM tenant_user;
SELECT COUNT(*) AS tenant_membership_count FROM tenant_user;

-- 6. Check for duplicate tenant membership pairs (expected: zero rows).
SELECT tenant_id, user_id, COUNT(*) AS duplicate_count
FROM tenant_user
GROUP BY tenant_id, user_id
HAVING COUNT(*) > 1;

-- 7. Check organization-unit tenant ownership and parent references.
SELECT id, tenant_id, parent_id, code, name, unit_type, is_active
FROM organization_units
ORDER BY tenant_id, id;
