<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::define(
            'permission',
            function (User $user, string $permissionCode, ?int $tenantId = null, ?int $organizationUnitId = null): bool {
                return $user->hasPermission($permissionCode, $tenantId, $organizationUnitId);
            }
        );

        // Send password-reset links to the React application, not the API host.
        ResetPassword::createUrlUsing(function (User $user, string $token): string {
            $frontendUrl = rtrim(
                (string) config('app.frontend_url', 'http://localhost:5173'),
                '/'
            );

            return $frontendUrl.'/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $user->getEmailForPasswordReset(),
            ]);
        });
    }
}
