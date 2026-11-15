
<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrganizationUnitController;
use App\Http\Controllers\Api\UserRoleAssignmentController;

/*
|--------------------------------------------------------------------------
| API Health Check
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'OolaEdNerve API is running.',
    ]);
});

/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/

Route::post('/auth/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Authentication
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Platform Admin Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('platform')->prefix('platform')->group(function () {

        Route::get('dashboard', [TenantController::class, 'dashboard']);

        Route::apiResource('tenants', TenantController::class)
            ->only(['index', 'show', 'store', 'update']);

        Route::patch('tenants/{id}/status', [TenantController::class, 'updateStatus']);
    });

    /*
    |--------------------------------------------------------------------------
    | Institution User Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('institution')->group(function () {

        // Current tenant
        Route::get('/tenant', [TenantController::class, 'show']);

        // Universal role catalogue
        Route::get('/roles', [RoleController::class, 'index']);
        Route::get('/roles/{role}', [RoleController::class, 'show']);

        // User Management
        Route::apiResource('users', UserController::class);

        // Organization Management
        Route::apiResource(
            'organization-units',
            OrganizationUnitController::class
        );

        // User Role Assignments
        Route::apiResource(
            'role-assignments',
            UserRoleAssignmentController::class
        );
    });
});
