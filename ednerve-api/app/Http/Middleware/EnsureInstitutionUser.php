<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureInstitutionUser
{
    /**
     * Allow access only to users belonging to an active institution.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            !$user ||
            !$user->isInstitutionUser() ||
            !$user->tenant()->where('status', 'active')->exists()
        ) {
            return response()->json([
                'message' => 'Access denied. An active institution account is required.',
            ], 403);
        }

        return $next($request);
    }
}
