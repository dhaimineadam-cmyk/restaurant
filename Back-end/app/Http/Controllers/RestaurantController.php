<?php

namespace App\Http\Controllers;

use App\Http\Resources\MenuResource;
use App\Http\Resources\RestaurantResource;
use App\Models\Menu;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class RestaurantController extends Controller
{
    public function index(Request $request)
    {
        $restaurants = Restaurant::query()
            ->active()
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->when($request->filled('city'), fn ($query) => $query->where('ville', $request->city))
            ->when($request->filled('cuisine'), fn ($query) => $query->where('type_cuisine', 'like', '%' . $request->cuisine . '%'))
            ->when($request->boolean('delivery'), fn ($query) => $query->where('delivery_available', true))
            ->when($request->boolean('halal'), fn ($query) => $query->where('is_halal', true))
            ->when($request->boolean('vegetarian'), fn ($query) => $query->where('is_vegetarian_friendly', true))
            ->when($request->filled('min_rating'), function ($query) use ($request) {
                $query->having('reviews_avg_rating', '>=', (float) $request->min_rating);
            })
            ->latest()
            ->paginate($request->integer('per_page', 12));

        return RestaurantResource::collection($restaurants);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:restaurants,slug',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'banner' => 'nullable|string',
            'adresse' => 'nullable|string|max:255',
            'ville' => 'required|string|max:120',
            'telephone' => 'nullable|string|max:40',
            'email' => 'nullable|email|max:255',
            'type_cuisine' => 'required|string|max:120',
            'horaires' => 'nullable|array',
            'status' => 'nullable|in:draft,active,inactive,suspended',
            'abonnement_plan' => 'nullable|string|max:80',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'delivery_available' => 'nullable|boolean',
            'is_halal' => 'nullable|boolean',
            'is_vegetarian_friendly' => 'nullable|boolean',
            'minimum_order_price' => 'nullable|numeric|min:0',
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['nom']);
        $data['owner_id'] = $request->user()?->id;

        $restaurant = Restaurant::create($data);

        return new RestaurantResource($restaurant->loadCount('reviews')->loadAvg('reviews', 'rating'));
    }

    public function show(string $slug)
    {
        $restaurant = Cache::remember("restaurants.public.$slug", 300, function () use ($slug) {
            return Restaurant::query()
                ->where('slug', $slug)
                ->active()
                ->with([
                    'categories' => fn ($query) => $query->withCount('menus'),
                    'menus' => fn ($query) => $query->with(['category'])->withCount('reviews')->withAvg('reviews', 'rating')->orderByDesc('is_available'),
                    'reviews.user',
                ])
                ->withCount('reviews')
                ->withAvg('reviews', 'rating')
                ->firstOrFail();
        });

        return new RestaurantResource($restaurant);
    }

    public function update(Request $request, Restaurant $restaurant)
    {
        $data = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:restaurants,slug,' . $restaurant->id,
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'banner' => 'nullable|string',
            'adresse' => 'nullable|string|max:255',
            'ville' => 'sometimes|string|max:120',
            'telephone' => 'nullable|string|max:40',
            'email' => 'nullable|email|max:255',
            'type_cuisine' => 'sometimes|string|max:120',
            'horaires' => 'nullable|array',
            'status' => 'nullable|in:draft,active,inactive,suspended',
            'abonnement_plan' => 'nullable|string|max:80',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'delivery_available' => 'nullable|boolean',
            'is_halal' => 'nullable|boolean',
            'is_vegetarian_friendly' => 'nullable|boolean',
            'minimum_order_price' => 'nullable|numeric|min:0',
        ]);

        $restaurant->update($data);
        Cache::forget("restaurants.public.$restaurant->slug");

        return new RestaurantResource($restaurant->loadCount('reviews')->loadAvg('reviews', 'rating'));
    }

    public function destroy(Restaurant $restaurant)
    {
        $restaurant->update(['status' => 'inactive']);

        return response()->json(['success' => 'Restaurant desactive']);
    }

    public function menus(Restaurant $restaurant, Request $request)
    {
        $menus = Menu::query()
            ->where('restaurant_id', $restaurant->id)
            ->with(['category'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->when($request->filled('category_id'), fn ($query) => $query->where('category_id', $request->category_id))
            ->when($request->filled('min_price'), fn ($query) => $query->where('price', '>=', $request->min_price))
            ->when($request->filled('max_price'), fn ($query) => $query->where('price', '<=', $request->max_price))
            ->when($request->filled('available'), fn ($query) => $query->where('is_available', $request->boolean('available')))
            ->paginate($request->integer('per_page', 12));

        return MenuResource::collection($menus);
    }

    public function nearby(Request $request)
    {
        $data = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:100',
        ]);

        $restaurants = Restaurant::query()
            ->active()
            ->nearby((float) $data['lat'], (float) $data['lng'], (int) ($data['radius'] ?? 20))
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->paginate($request->integer('per_page', 12));

        return RestaurantResource::collection($restaurants);
    }

    /**
     * Filter restaurants by selected menu ids.
     * Accepts `menu_ids` as array (GET params or query string: menu_ids[]=1&menu_ids[]=2)
     */
    public function byMenu(Request $request)
    {
        $data = $request->validate([
            'menu_ids' => 'nullable|array',
            'menu_ids.*' => 'integer|exists:menus,id',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $menuIds = $data['menu_ids'] ?? [];

        $query = Restaurant::query()
            ->active()
            ->withCount('reviews')
            ->withAvg('reviews', 'rating');

        if (!empty($menuIds)) {
            $query->whereHas('menus', fn ($q) => $q->whereIn('menus.id', $menuIds));
        }

        $restaurants = $query->latest()->paginate($request->integer('per_page', 12));

        return RestaurantResource::collection($restaurants);
    }
}
