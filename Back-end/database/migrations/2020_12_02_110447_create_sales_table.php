<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSalesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('sales')) {
            return;
        }

        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('table_id')->constrained('tables');
            $table->foreignId('servant_id')->constrained('servants');
            // The foreign key is added in a later migration because menus
            // is created after sales in this project.
            $table->foreignId('menu_id');
            $table->integer('quantity');
            $table->decimal('total_price', 8, 2);
            $table->string('payment_type'); // Exemple : "cash", "card"
            $table->string('payment_status'); // Exemple : "paid", "pending"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sales');
    }
}
