<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuditService
{
    /**
     * Record a security or business event. Secrets and credential-like fields
     * are removed recursively before values are persisted.
     */
    public function record(
        Request $request,
        string $event,
        string $module,
        ?Model $subject = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $description = null,
        ?int $tenantId = null,
    ): AuditLog {
        $resolvedTenantId = $tenantId ?? $request->attributes->get('tenant_id');
        $requestId = $request->attributes->get('request_id')
            ?? $request->header('X-Request-ID');

        if (!is_string($requestId) || !preg_match('/^[A-Za-z0-9._:-]{1,64}$/', $requestId)) {
            $requestId = (string) Str::uuid();
        }

        return AuditLog::create([
            'tenant_id' => is_numeric($resolvedTenantId) ? (int) $resolvedTenantId : null,
            'actor_user_id' => $request->user()?->getAuthIdentifier(),
            'organization_unit_id' => $request->attributes->get('organization_unit_id'),
            'event' => Str::limit($event, 120, ''),
            'module' => Str::limit($module, 80, ''),
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey() !== null ? (string) $subject->getKey() : null,
            'description' => $description ? Str::limit($description, 500, '') : null,
            'old_values' => $this->sanitize($oldValues),
            'new_values' => $this->sanitize($newValues),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent() ? Str::limit($request->userAgent(), 1000, '') : null,
            'request_id' => $requestId,
            'created_at' => now(),
        ]);
    }

    private function sanitize(?array $values): ?array
    {
        if ($values === null) {
            return null;
        }

        $blocked = [
            'password', 'password_confirmation', 'current_password',
            'token', 'access_token', 'refresh_token', 'remember_token',
            'otp', 'verification_code', 'secret', 'client_secret',
            'authorization', 'api_key', 'private_key',
        ];

        $clean = [];
        foreach ($values as $key => $value) {
            if (in_array(strtolower((string) $key), $blocked, true)) {
                continue;
            }

            if (is_array($value)) {
                $clean[$key] = $this->sanitize($value);
            } elseif (is_scalar($value) || $value === null) {
                $clean[$key] = $value;
            } else {
                $clean[$key] = (string) $value;
            }
        }

        return $clean;
    }
}
