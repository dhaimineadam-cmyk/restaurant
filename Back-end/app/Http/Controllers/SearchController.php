<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Http\Resources\MenuResource;
use App\Http\Resources\RestaurantResource;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'q' => 'nullable|string|max:120',
            'ville' => 'nullable|string|max:120',
            'cuisine' => 'nullable|string|max:120',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'note' => 'nullable|numeric|min:1|max:5',
            'available' => 'nullable|boolean',
            'delivery' => 'nullable|boolean',
            'halal' => 'nullable|boolean',
            'vegetarian' => 'nullable|boolean',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'radius' => 'nullable|numeric|min:1|max:100',
            'per_page' => 'nullable|integer|min:1|max:30',
        ]);

        $term = trim($data['q'] ?? '');
        $like = '%' . $term . '%';
        $perPage = (int) ($data['per_page'] ?? 8);
        $hasLocation = isset($data['lat'], $data['lng']);
        $radius = (int) ($data['radius'] ?? 50);

        $restaurants = Restaurant::query()
            ->active()
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->when($term !== '', function ($query) use ($like) {
                $query->where(function ($query) use ($like) {
                    $query->where('nom', 'like', $like)
                        ->orWhere('description', 'like', $like)
                        ->orWhere('type_cuisine', 'like', $like)
                        ->orWhereHas('menus', fn ($menuQuery) => $menuQuery->where('title', 'like', $like))
                        ->orWhereHas('categories', fn ($categoryQuery) => $categoryQuery->where('title', 'like', $like));
                });
            })
            ->when($request->filled('ville'), fn ($query) => $query->where('ville', $data['ville']))
            ->when($request->filled('cuisine'), fn ($query) => $query->where('type_cuisine', 'like', '%' . $data['cuisine'] . '%'))
            ->when($request->boolean('delivery'), fn ($query) => $query->where('delivery_available', true))
            ->when($request->boolean('halal'), fn ($query) => $query->where('is_halal', true))
            ->when($request->boolean('vegetarian'), fn ($query) => $query->where('is_vegetarian_friendly', true))
            ->when($request->filled('note'), fn ($query) => $query->having('reviews_avg_rating', '>=', (float) $data['note']))
            ->when($hasLocation, fn ($query) => $query->nearby($data['lat'], $data['lng'], $radius), fn ($query) => $query->latest())
            ->paginate($perPage, ['*'], 'restaurants_page');

        $menus = Menu::query()
            ->with(['category', 'restaurant'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->whereHas('restaurant', fn ($query) => $query->active())
            ->when($term !== '', function ($query) use ($like) {
                $query->where(function ($query) use ($like) {
                    $query->where('title', 'like', $like)
                        ->orWhere('description', 'like', $like)
                        ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('title', 'like', $like))
                        ->orWhereHas('restaurant', fn ($restaurantQuery) => $restaurantQuery->where('type_cuisine', 'like', $like));
                });
            })
            ->when($request->filled('min_price'), fn ($query) => $query->where('price', '>=', $data['min_price']))
            ->when($request->filled('max_price'), fn ($query) => $query->where('price', '<=', $data['max_price']))
            ->when($request->filled('available'), fn ($query) => $query->where('is_available', $request->boolean('available')))
            ->paginate($perPage, ['*'], 'menus_page');

        $categories = Category::query()
            ->withCount('menus')
            ->when($term !== '', fn ($query) => $query->where('title', 'like', $like))
            ->paginate($perPage, ['*'], 'categories_page');

        return response()->json([
            'restaurants' => RestaurantResource::collection($restaurants)->response()->getData(true),
            'menus' => MenuResource::collection($menus)->response()->getData(true),
            'categories' => CategoryResource::collection($categories)->response()->getData(true),
        ]);
    }
}
