<?php

namespace App\Http\Controllers;

use App\Models\Livreur;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with("User")->orderByDesc("id_order")->paginate(7);
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        Log::info('POST /orders payload received', $request->all());

        try {
            $validated = $request->validate([
                "total_price" => "required|numeric",
                "payment_method" => "required|string",
                "id_user" => "required|exists:users,id",
                "menu" => "required|string",
            ]);

            $order = Order::create([
                ...$validated,
                "status" => $request->input("status", "en attente"),
            ]);

            Log::info('Order saved successfully', ['order' => $order->toArray()]);

            return response()->json($order->load("User"), 201);
        } catch (\Throwable $e) {
            Log::error('Order creation failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Erreur lors de la creation de la commande',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Order $order, $id)
    {
        $order = Order::with("User")->find($id);
        return response()->json($order);
    }

    public function update(Request $request, $id)
    {
        $order = Order::find($id);
        $orders = $request->validate([
            "total_price" => "required|numeric",
            "status" => "required|string",
            "payment_method" => "required|string",
            "id_user" => "required|exists:users,id",
            "menu" => "required|string",
        ]);
        $order->update($orders);
        return response()->json($order);
    }

    public function destroy($id)
    {
        $order = Order::find($id);
        $order->delete();
        return response()->json(["message" => "Order deleted successfully"]);
    }

    public function getOrderByIdUser($id)
    {
        $orders = Order::where("id_user", $id)->orderByDesc("id_order")->get();
        return response()->json($orders);
    }

    public function getlivreuractif()
    {
        $livreur = Livreur::where('status', 'actif')->get();
        return response()->json($livreur);
    }

    public function updatestatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|max:50',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $validated['status']]);
        return response()->json($order);
    }
}
