<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => $this->logo,
            'banner' => $this->banner,
            'adresse' => $this->adresse,
            'ville' => $this->ville,
            'telephone' => $this->telephone,
            'email' => $this->email,
            'type_cuisine' => $this->type_cuisine,
            'horaires' => $this->horaires,
            'status' => $this->status,
            'abonnement_plan' => $this->abonnement_plan,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'delivery_available' => $this->delivery_available,
            'is_halal' => $this->is_halal,
            'is_vegetarian_friendly' => $this->is_vegetarian_friendly,
            'minimum_order_price' => $this->minimum_order_price,
            'rating_average' => round((float) ($this->reviews_avg_rating ?? 0), 1),
            'reviews_count' => (int) ($this->reviews_count ?? 0),
            'distance' => $this->when(isset($this->distance), round((float) $this->distance, 2)),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'menus' => MenuResource::collection($this->whenLoaded('menus')),
            'reviews' => RestaurantReviewResource::collection($this->whenLoaded('reviews')),
        ];
    }
}
