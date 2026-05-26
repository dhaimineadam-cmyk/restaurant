<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Reservation;
use App\Models\Restaurant;
use App\Models\Sales;

class RestaurantDashboardController extends Controller
{
    public function show(Restaurant $restaurant)
    {
        return response()->json([
            'restaurant' => [
                'id' => $restaurant->id,
                'nom' => $restaurant->nom,
                'slug' => $restaurant->slug,
                'plan' => $restaurant->abonnement_plan,
            ],
            'stats' => [
                'menus' => $restaurant->menus()->count(),
                'categories' => $restaurant->categories()->count(),
                'orders' => Order::where('restaurant_id', $restaurant->id)->count(),
                'reservations' => Reservation::where('restaurant_id', $restaurant->id)->count(),
                'sales_total' => (float) Sales::where('restaurant_id', $restaurant->id)->sum('total_price'),
                'reviews_average' => round((float) $restaurant->reviews()->avg('rating'), 1),
                'reviews_count' => $restaurant->reviews()->count(),
            ],
        ]);
    }
}
