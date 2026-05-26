<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = [
        'menus',
        'categories',
        'orders',
        'reservations',
        'stocks',
        'fournisseurs',
        'livreurs',
        'servants',
        'sales',
        'tables',
    ];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            if (! Schema::hasTable($tableName) || Schema::hasColumn($tableName, 'restaurant_id')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('restaurant_id')
                    ->nullable()
                    ->constrained('restaurants')
                    ->nullOnDelete();
            });
        }

        if (Schema::hasTable('menus')) {
            Schema::table('menus', function (Blueprint $table) {
                if (! Schema::hasColumn('menus', 'is_available')) {
                    $table->boolean('is_available')->default(true)->index();
                }
                if (! Schema::hasColumn('menus', 'speciality_tags')) {
                    $table->json('speciality_tags')->nullable();
                }
            });
        }

        if (Schema::hasTable('users') && ! Schema::hasColumn('users', 'restaurant_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('restaurant_id')->nullable()->after('role')->constrained('restaurants')->nullOnDelete();
                $table->index(['role', 'restaurant_id']);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'restaurant_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropConstrainedForeignId('restaurant_id');
            });
        }

        if (Schema::hasTable('menus')) {
            Schema::table('menus', function (Blueprint $table) {
                if (Schema::hasColumn('menus', 'is_available')) {
                    $table->dropColumn('is_available');
                }
                if (Schema::hasColumn('menus', 'speciality_tags')) {
                    $table->dropColumn('speciality_tags');
                }
            });
        }

        foreach (array_reverse($this->tables) as $tableName) {
            if (! Schema::hasTable($tableName) || ! Schema::hasColumn($tableName, 'restaurant_id')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) {
                $table->dropConstrainedForeignId('restaurant_id');
            });
        }
    }
};
