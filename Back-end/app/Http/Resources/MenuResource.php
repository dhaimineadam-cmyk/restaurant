<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'image' => $this->image,
            'price' => $this->price,
            'category_id' => $this->category_id,
            'restaurant_id' => $this->restaurant_id,
            'is_available' => (bool) ($this->is_available ?? true),
            'speciality_tags' => $this->speciality_tags,
            'rating_average' => round((float) ($this->reviews_avg_rating ?? 0), 1),
            'reviews_count' => (int) ($this->reviews_count ?? 0),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'restaurant' => new RestaurantResource($this->whenLoaded('restaurant')),
        ];
    }
}
