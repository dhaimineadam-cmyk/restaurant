<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'nom',
        'slug',
        'description',
        'logo',
        'banner',
        'adresse',
        'ville',
        'telephone',
        'email',
        'type_cuisine',
        'horaires',
        'status',
        'abonnement_plan',
        'latitude',
        'longitude',
        'delivery_available',
        'is_halal',
        'is_vegetarian_friendly',
        'minimum_order_price',
    ];

    protected $casts = [
        'horaires' => 'array',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'delivery_available' => 'boolean',
        'is_halal' => 'boolean',
        'is_vegetarian_friendly' => 'boolean',
        'minimum_order_price' => 'decimal:2',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function menus()
    {
        return $this->hasMany(Menu::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(RestaurantReview::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeNearby(Builder $query, float $latitude, float $longitude, int $radiusKm = 20): Builder
    {
        $haversine = '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))';

        return $query
            ->select('restaurants.*')
            ->selectRaw($haversine . ' AS distance', [$latitude, $longitude, $latitude])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->having('distance', '<=', $radiusKm)
            ->orderBy('distance');
    }
}
