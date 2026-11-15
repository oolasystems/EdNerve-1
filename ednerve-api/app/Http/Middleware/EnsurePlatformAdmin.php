<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePlatformAdmin
{
    /**
     * Allow access only to Platform Admin accounts.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isPlatformAdmin()) {
            return response()->json([
                'message' => 'Access denied. Platform Admin privileges are required.',
            ], 403);
        }

        return $next($request);
    }
}
