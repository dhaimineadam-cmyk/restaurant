<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nom');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->string('banner')->nullable();
            $table->string('adresse')->nullable();
            $table->string('ville')->index();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();
            $table->string('type_cuisine')->index();
            $table->json('horaires')->nullable();
            $table->enum('status', ['draft', 'active', 'inactive', 'suspended'])->default('active')->index();
            $table->string('abonnement_plan')->default('basic')->index();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->boolean('delivery_available')->default(true)->index();
            $table->boolean('is_halal')->default(false)->index();
            $table->boolean('is_vegetarian_friendly')->default(false)->index();
            $table->decimal('minimum_order_price', 8, 2)->nullable();
            $table->timestamps();

            $table->fullText(['nom', 'description', 'type_cuisine', 'ville']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
