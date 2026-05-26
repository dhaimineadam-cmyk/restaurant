<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Exception;
use Illuminate\Http\Request;
use PDOException;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            return Category::query()
                ->when($request->query('restaurant_id'), fn ($query, $restaurantId) => $query->where('restaurant_id', $restaurantId))
                ->paginate(10);
        } catch (PDOException | Exception $e) {
            return response()->json(["message" => "Erreur lors de la recuperation des categories"], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $category = $request->validate([
                'title' => 'required|string',
                'slug' => 'required|string',
                'restaurant_id' => 'nullable|exists:restaurants,id',
            ]);

            return Category::create($category);
        } catch (PDOException | Exception $e) {
            return response()->json(["message" => "Erreur lors de la creation de la categorie"], 404);
        }
    }

    public function show(string $id)
    {
        try {
            $category = Category::find($id);

            if (!$category) {
                return response()->json(['message' => 'Categorie introuvable'], 404);
            }

            return response()->json($category, 200);
        } catch (PDOException | Exception $e) {
            return response()->json(["message" => "Erreur lors de la recuperation de la categorie"], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $categoryData = $request->validate([
                'title' => 'required|string',
                'slug' => 'required|string',
                'restaurant_id' => 'nullable|exists:restaurants,id',
            ]);

            $category = Category::find($id);
            if (!$category) {
                return response()->json(['message' => 'Categorie introuvable'], 404);
            }

            $category->update($categoryData);

            return response()->json($category, 200);
        } catch (PDOException | Exception $e) {
            return response()->json(["message" => "Erreur lors de la mise a jour de la categorie"], 404);
        }
    }

    public function destroy(string $id)
    {
        try {
            $deleted = Category::destroy($id);

            if ($deleted === 0) {
                return response()->json(['message' => 'Categorie introuvable'], 404);
            }

            return response()->json(['message' => 'Categorie supprimee avec succes'], 200);
        } catch (PDOException | Exception $e) {
            return response()->json(["message" => "Erreur lors de la suppression de la categorie"], 404);
        }
    }
}
