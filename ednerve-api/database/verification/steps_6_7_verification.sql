-- Permission catalogue and role-permission mappings
SELECT COUNT(*) AS permission_count FROM permissions;
SELECT module, COUNT(*) AS permission_count FROM permissions GROUP BY module ORDER BY module;
SELECT COUNT(*) AS role_permission_count FROM role_permission;

-- Role assignment distribution
SELECT r.code AS role_code, COUNT(ura.id) AS assignment_count
FROM roles r
LEFT JOIN user_role_assignments ura ON ura.role_id = r.id
GROUP BY r.id, r.code
ORDER BY r.code;

-- Review assignments with their tenant and organization scope
SELECT u.id AS user_id, u.name AS user_name, r.code AS role_code,
       t.code AS tenant_code, ou.code AS organization_unit_code,
       ura.is_active, ura.starts_at, ura.ends_at
FROM user_role_assignments ura
JOIN users u ON u.id = ura.user_id
JOIN roles r ON r.id = ura.role_id
LEFT JOIN tenants t ON t.id = ura.tenant_id
LEFT JOIN organization_units ou ON ou.id = ura.organization_unit_id
ORDER BY u.id, r.code;

-- Check that tenant-scoped assignments reference a tenant membership.
SELECT ura.id, ura.user_id, ura.role_id, ura.tenant_id
FROM user_role_assignments ura
LEFT JOIN tenant_user tu ON tu.user_id = ura.user_id AND tu.tenant_id = ura.tenant_id
WHERE ura.tenant_id IS NOT NULL AND tu.id IS NULL;

-- Check that organization-scoped assignments stay within the same tenant.
SELECT ura.id, ura.tenant_id, ura.organization_unit_id, ou.tenant_id AS organization_tenant_id
FROM user_role_assignments ura
JOIN organization_units ou ON ou.id = ura.organization_unit_id
WHERE ura.organization_unit_id IS NOT NULL
  AND (ura.tenant_id IS NULL OR ura.tenant_id <> ou.tenant_id);
