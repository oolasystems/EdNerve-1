# Phase 2.5 – Authorization and Tenant-Isolation Test Cases

These are integration test scenarios to execute after the route and middleware wiring. They deliberately do not assume a particular factory or seeder implementation.

| # | Scenario | Expected result |
|---|---|---|
| 1 | Unauthenticated request to a protected route | HTTP 401 |
| 2 | Authenticated user without active institution context calls tenant-scoped route | HTTP 422 `TENANT_CONTEXT_REQUIRED` |
| 3 | User has active membership and required permission in selected tenant | Request reaches controller |
| 4 | User has no required permission | HTTP 403 `PERMISSION_DENIED` |
| 5 | User has permission only in Tenant A but selects Tenant B | HTTP 403 |
| 6 | Organization unit belongs to selected tenant and user has matching scoped permission | Request reaches controller |
| 7 | Organization unit belongs to a different tenant | HTTP 403 `ORGANIZATION_UNIT_OUT_OF_SCOPE` |
| 8 | Non-numeric or zero organization-unit identifier | HTTP 422 `INVALID_ORGANIZATION_UNIT` |
| 9 | Organization-wide role assignment is used with a valid unit in the same tenant | Permission is granted if active |
| 10 | Organization-specific role assignment is used with a different unit | HTTP 403 |
| 11 | Assignment is inactive, not yet effective, or expired | HTTP 403 |
| 12 | Role or permission is inactive | HTTP 403 |

## Data-isolation assertion

Permission middleware does not filter records. Every tenant-owned query in a controller/service must still include the validated tenant ID:

```php
$tenantId = (int) $request->attributes->get('tenant_id');

$records = ExampleResource::query()
    ->where('tenant_id', $tenantId)
    ->paginate();
```

For organization-scoped records, also constrain `organization_unit_id` using the validated request attribute. Never use a raw tenant or organization-unit ID from the request as the query boundary.
