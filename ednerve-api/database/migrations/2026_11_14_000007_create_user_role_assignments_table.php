
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_role_assignments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')
                ->constrained('tenants')
                ->restrictOnDelete();

            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('organization_unit_id')->nullable();

            $table->boolean('is_primary')->default(false);

            $table->string('status', 20)->default('active');

            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();

            $table->timestamps();

            // User must belong to the same tenant.
            $table->foreign(
                ['tenant_id', 'user_id'],
                'ura_tenant_user_foreign'
            )
                ->references(['tenant_id', 'id'])
                ->on('users')
                ->cascadeOnDelete();

            // Role is universal and shared across all tenants.
            $table->foreign('role_id', 'ura_role_foreign')
                ->references('id')
                ->on('roles')
                ->restrictOnDelete();

            // Organization unit must belong to the same tenant.
            // NULL means institution-wide assignment.
            $table->foreign(
                ['tenant_id', 'organization_unit_id'],
                'ura_tenant_org_unit_foreign'
            )
                ->references(['tenant_id', 'id'])
                ->on('organization_units')
                ->restrictOnDelete();

            $table->index(
                ['tenant_id', 'user_id'],
                'ura_tenant_user_index'
            );

            $table->index(
                ['tenant_id', 'role_id'],
                'ura_tenant_role_index'
            );

            $table->index(
                ['tenant_id', 'organization_unit_id'],
                'ura_tenant_org_unit_index'
            );

            $table->index(
                ['tenant_id', 'status'],
                'ura_tenant_status_index'
            );

            $table->index(
                ['user_id', 'is_primary', 'status'],
                'ura_user_primary_status_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_role_assignments');
    }
};
