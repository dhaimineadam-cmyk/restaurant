<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;
    protected $fillable = [
        'title','slug','description','image','price','category_id','restaurant_id','is_available','speciality_tags'
    ];
    protected $casts = [
        'is_available' => 'boolean',
        'speciality_tags' => 'array',
    ];
    public function Category(){
        return $this->belongsTo(Category::class,'category_id','id');
    }
    public function restaurant(){
        return $this->belongsTo(Restaurant::class);
    }
    public function reviews(){
        return $this->hasMany(MenuReview::class);
    }
    public function getRouteKeyName(){
        return 'slug';
    }
    public function sales(){
        return $this->hasMany(Sales::class);
    }
}
