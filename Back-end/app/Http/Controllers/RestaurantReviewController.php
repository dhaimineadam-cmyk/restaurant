<?php

namespace App\Http\Controllers;

use App\Http\Resources\RestaurantReviewResource;
use App\Models\Restaurant;
use App\Models\RestaurantReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RestaurantReviewController extends Controller
{
    public function index(Restaurant $restaurant)
    {
        return RestaurantReviewResource::collection(
            $restaurant->reviews()->with('user')->latest()->paginate(10)
        );
    }

    public function store(Request $request, Restaurant $restaurant)
    {
        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        $review = RestaurantReview::updateOrCreate(
            ['user_id' => $request->user()->id, 'restaurant_id' => $restaurant->id],
            $data
        );

        Cache::forget("restaurants.public.$restaurant->slug");

        return new RestaurantReviewResource($review->load('user'));
    }
}
