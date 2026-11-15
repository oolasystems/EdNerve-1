SELECT 'tenants' AS table_name, COUNT(*) AS total FROM tenants
UNION ALL SELECT 'organization_units', COUNT(*) FROM organization_units
UNION ALL SELECT 'roles', COUNT(*) FROM roles
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'tenant_user', COUNT(*) FROM tenant_user
UNION ALL SELECT 'permissions', COUNT(*) FROM permissions
UNION ALL SELECT 'role_permission', COUNT(*) FROM role_permission
UNION ALL SELECT 'user_role_assignments', COUNT(*) FROM user_role_assignments;

SELECT r.code AS role_code, COUNT(rp.permission_id) AS permission_count
FROM roles r LEFT JOIN role_permission rp ON rp.role_id=r.id
GROUP BY r.id,r.code ORDER BY r.id;

SELECT t.code AS tenant_code, COUNT(DISTINCT ou.id) AS organization_units
FROM tenants t LEFT JOIN organization_units ou ON ou.tenant_id=t.id
GROUP BY t.id,t.code ORDER BY t.id;

SELECT r.code AS role_code, COUNT(DISTINCT ura.user_id) AS assigned_users
FROM roles r LEFT JOIN user_role_assignments ura ON ura.role_id=r.id
GROUP BY r.id,r.code ORDER BY r.id;
