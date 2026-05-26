<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Menu;
use Exception;
use Illuminate\Http\Request;
use PDOException;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        try {
            $categoryId = $request->query('category_id');
            $restaurantId = $request->query('restaurant_id');

            $menus = Menu::with(['category', 'restaurant'])
                ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
                ->when($restaurantId, fn ($query) => $query->where('restaurant_id', $restaurantId))
                ->paginate(7);

            $categories = Category::query()
                ->when($restaurantId, fn ($query) => $query->where('restaurant_id', $restaurantId))
                ->get();

            return response()->json([
                'menus' => $menus,
                'categories' => $categories,
            ]);
        } catch (PDOException | Exception $e) {
            return response()->json(["message" => "Erreur lors de la recuperation des menus"], 404);
        }
    }

    public function getMenuByCategory(Request $request)
    {
        try {
            $restaurantId = $request->query('restaurant_id');
            $menus = Category::with("menus")
                ->when($restaurantId, fn ($query) => $query->where('restaurant_id', $restaurantId))
                ->get();

            return response()->json($menus);
        } catch (PDOException | Exception $e) {
            return response()->json(['message' => 'Errors Serveur'], 404);
        }
    }

    public function index2(Request $request)
    {
        try {
            $categoryId = $request->query('category_id');
            $restaurantId = $request->query('restaurant_id');

            $menus = Menu::query()
                ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
                ->when($restaurantId, fn ($query) => $query->where('restaurant_id', $restaurantId))
                ->get();

            $categories = Category::query()
                ->when($restaurantId, fn ($query) => $query->where('restaurant_id', $restaurantId))
                ->get();

            return response()->json([
                'menus' => $menus,
                'categories' => $categories,
            ]);
        } catch (PDOException | Exception $e) {
            return response()->json(['message' => 'Errors servrue'], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $menu = $request->validate([
                'title' => 'required|string|unique:menus,title',
                'slug' => 'required|string',
                'description' => 'required|string',
                'price' => 'required|numeric',
                'image' => 'required|image|mimes:jpg,png,jpeg|max:2048',
                'category_id' => 'required|numeric',
                'restaurant_id' => 'nullable|exists:restaurants,id',
                'is_available' => 'nullable|boolean',
                'speciality_tags' => 'nullable|array',
            ]);

            $fileNameImage = $request->file('image')->store('ImageMenus', "public");
            $menu['image'] = $fileNameImage;
            Menu::create($menu);

            return response()->json([
                'success' => 'menu bien cree',
            ]);
        } catch (PDOException | Exception $e) {
            return response()->json(["message" => "Erreur lors de la creation du menu"], 404);
        }
    }

    public function show(string $id)
    {
        try {
            return Menu::with(['category', 'restaurant'])->find($id);
        } catch (PDOException | Exception $e) {
            return response()->json(["message" => "Erreur lors de la recuperation du menu"], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $validatedData = $request->validate([
                'title' => 'required|string|unique:menus,title,' . $id,
                'slug' => 'required|string',
                'description' => 'required|string',
                'price' => 'required|numeric',
                'category_id' => 'required|numeric',
                'restaurant_id' => 'nullable|exists:restaurants,id',
                'is_available' => 'nullable|boolean',
                'speciality_tags' => 'nullable|array',
                'image' => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
            ]);

            $menu = Menu::find($id);
            if (!$menu) {
                return response()->json(['error' => 'Menu non trouve'], 404);
            }

            $menu->title = $validatedData['title'];
            $menu->slug = $validatedData['slug'];
            $menu->description = $validatedData['description'];
            $menu->price = $validatedData['price'];
            $menu->category_id = $validatedData['category_id'];
            $menu->restaurant_id = $validatedData['restaurant_id'] ?? $menu->restaurant_id;
            $menu->is_available = $validatedData['is_available'] ?? $menu->is_available;
            $menu->speciality_tags = $validatedData['speciality_tags'] ?? $menu->speciality_tags;

            if ($request->hasFile('image')) {
                $fileNameImage = $request->file('image')->store('ImageMenus', 'public');
                $menu->image = $fileNameImage;
            }

            $menu->save();

            return response()->json(['success' => 'Menu bien modifie']);
        } catch (PDOException | Exception $e) {
            return response()->json(["message" => "Erreur lors de la mise a jour du menu"], 404);
        }
    }

    public function destroy(string $id)
    {
        try {
            Menu::destroy($id);
            return response()->json([
                'success' => 'menu bien supprimer ',
            ]);
        } catch (PDOException | Exception $e) {
            return response()->json(['message' => 'Errors Serveur'], 404);
        }
    }
}
