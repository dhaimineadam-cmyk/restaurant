<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('sales') || ! Schema::hasTable('menus') || ! Schema::hasColumn('sales', 'menu_id')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            $table->foreign('menu_id')->references('id')->on('menus');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('sales') || ! Schema::hasColumn('sales', 'menu_id')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['menu_id']);
        });
    }
};
