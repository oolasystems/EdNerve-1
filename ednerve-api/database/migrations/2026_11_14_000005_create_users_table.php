<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // platform or institution
            $table->string('account_type', 20)
                ->default('institution');

            // NULL for platform users; mandatory for institution users
            $table->foreignId('tenant_id')
                ->nullable()
                ->constrained('tenants')
                ->restrictOnDelete();

            $table->string('name', 150);

            // Globally unique email
            $table->string('email', 150)
                ->unique('users_email_unique');

            $table->string('phone', 30)->nullable();

            $table->string('password');

            $table->string('profile_photo', 255)->nullable();

            $table->string('status', 20)->default('active');

            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->timestamp('last_login_at')->nullable();

            $table->rememberToken();
            $table->timestamps();

            // Supports composite FK from user_role_assignments.
            $table->unique(
                ['tenant_id', 'id'],
                'users_tenant_id_unique'
            );

            $table->index(
                ['tenant_id', 'status'],
                'users_tenant_status_index'
            );

            $table->index(
                ['account_type', 'status'],
                'users_account_type_status_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
