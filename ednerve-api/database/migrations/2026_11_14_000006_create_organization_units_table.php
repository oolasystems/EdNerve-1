<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organization_units', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tenant_id')
                ->constrained('tenants')
                ->restrictOnDelete();

            $table->unsignedBigInteger('parent_id')->nullable();

            $table->string('code', 50);
            $table->string('name', 200);

            $table->string('unit_type', 50);

            $table->text('description')->nullable();

            $table->string('status', 20)->default('active');

            $table->timestamps();

            $table->unique(
                ['tenant_id', 'code'],
                'organization_units_tenant_code_unique'
            );

            // Supports tenant-safe parent and assignment references.
            $table->unique(
                ['tenant_id', 'id'],
                'organization_units_tenant_id_unique'
            );

            // Parent must belong to the same tenant.
            $table->foreign(
                ['tenant_id', 'parent_id'],
                'organization_units_tenant_parent_foreign'
            )
                ->references(['tenant_id', 'id'])
                ->on('organization_units')
                ->restrictOnDelete();

            $table->index(
                ['tenant_id', 'parent_id'],
                'organization_units_tenant_parent_index'
            );

            $table->index(
                ['tenant_id', 'unit_type'],
                'organization_units_tenant_type_index'
            );

            $table->index(
                ['tenant_id', 'status'],
                'organization_units_tenant_status_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_units');
    }
};