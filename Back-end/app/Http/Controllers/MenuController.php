<?php
 
namespace App\Http\Controllers;
 
use App\Models\Category;
use App\Models\Menu;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use PDOException;
 
class MenuController extends Controller
{
    private function uploadToCloudinary($file)
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey    = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');
 
        $timestamp = time();
        $folder    = 'srms/menus';
        $params    = "folder={$folder}&timestamp={$timestamp}{$apiSecret}";
        $signature = sha1($params);
 
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, [
            'file'      => new \CURLFile($file->getRealPath(), $file->getMimeType(), $file->getClientOriginalName()),
            'api_key'   => $apiKey,
            'timestamp' => $timestamp,
            'signature' => $signature,
            'folder'    => $folder,
        ]);
 
        $response = curl_exec($ch);
        curl_close($ch);
 
        $data = json_decode($response, true);
 
        if (isset($data['secure_url'])) {
            return $data['secure_url'];
        }
 
        throw new Exception('Cloudinary upload failed: ' . json_encode($data));
    }
 
    public function index(Request $request)
    {
        try {
            $categoryId   = $request->query('category_id');
            $restaurantId = $request->query('restaurant_id');
 
            $perPage = (int) $request->query('per_page', 7);
            $perPage = max(1, min($perPage, 100));
 
            $menus = Menu::with(['category', 'restaurant'])
                ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
                ->when($restaurantId, fn ($query) => $query->where('restaurant_id', $restaurantId))
                ->paginate($perPage);
 
            $categories = Category::query()
                ->when($restaurantId, fn ($query) => $query->where('restaurant_id', $restaurantId))
                ->get();
 
            return response()->json([
                'menus'      => $menus,
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
            $categoryId   = $request->query('category_id');
            $restaurantId = $request->query('restaurant_id');
 
            $menus = Menu::query()
                ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
                ->when($restaurantId, fn ($query) => $query->where('restaurant_id', $restaurantId))
                ->get();
 
            $categories = Category::query()
                ->when($restaurantId, fn ($query) => $query->where('restaurant_id', $restaurantId))
                ->get();
 
            return response()->json([
                'menus'      => $menus,
                'categories' => $categories,
            ]);
        } catch (PDOException | Exception $e) {
            return response()->json(['message' => 'Errors servrue'], 404);
        }
    }
 
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title'          => 'required|string|unique:menus,title',
                'slug'           => 'required|string',
                'description'    => 'required|string',
                'price'          => 'required|numeric',
                'image'          => 'required|image|mimes:jpg,png,jpeg|max:2048',
                'category_id'    => 'required|exists:categories,id',
                'restaurant_id'  => 'nullable|exists:restaurants,id',
                'is_available'   => 'nullable|boolean',
                'speciality_tags'=> 'nullable|array',
            ]);
 
            // Upload image vers Cloudinary via cURL
            $validated['image'] = $this->uploadToCloudinary($request->file('image'));
 
            Menu::create($validated);
 
            return response()->json(['success' => 'menu bien cree']);
        } catch (ValidationException $e) {
            throw $e;
        } catch (PDOException | Exception $e) {
            Log::error('Erreur lors de la creation du menu', ['error' => $e->getMessage()]);
            return response()->json(["message" => "Erreur lors de la creation du menu: " . $e->getMessage()], 500);
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
                'title'          => 'required|string|unique:menus,title,' . $id,
                'slug'           => 'required|string',
                'description'    => 'required|string',
                'price'          => 'required|numeric',
                'category_id'    => 'required|exists:categories,id',
                'restaurant_id'  => 'nullable|exists:restaurants,id',
                'is_available'   => 'nullable|boolean',
                'speciality_tags'=> 'nullable|array',
                'image'          => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
            ]);
 
            $menu = Menu::find($id);
            if (!$menu) {
                return response()->json(['error' => 'Menu non trouve'], 404);
            }
 
            $menu->title       = $validatedData['title'];
            $menu->slug        = $validatedData['slug'];
            $menu->description = $validatedData['description'];
            $menu->price       = $validatedData['price'];
            $menu->category_id = $validatedData['category_id'];
            $menu->restaurant_id   = $validatedData['restaurant_id'] ?? $menu->restaurant_id;
            $menu->is_available    = $validatedData['is_available'] ?? $menu->is_available;
            $menu->speciality_tags = $validatedData['speciality_tags'] ?? $menu->speciality_tags;
 
            if ($request->hasFile('image')) {
                $menu->image = $this->uploadToCloudinary($request->file('image'));
            }
 
            $menu->save();
 
            return response()->json(['success' => 'Menu bien modifie']);
        } catch (ValidationException $e) {
            throw $e;
        } catch (PDOException | Exception $e) {
            Log::error('Erreur lors de la mise a jour du menu', ['error' => $e->getMessage()]);
            return response()->json(["message" => "Erreur lors de la mise a jour du menu"], 500);
        }
    }
 
    public function destroy(string $id)
    {
        try {
            Menu::destroy($id);
            return response()->json(['success' => 'menu bien supprimer']);
        } catch (PDOException | Exception $e) {
            return response()->json(['message' => 'Errors Serveur'], 404);
        }
    }
}