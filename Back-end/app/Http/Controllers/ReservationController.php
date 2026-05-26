<?php

namespace App\Http\Controllers;

use App\Models\Livreur;
use App\Models\Livrison;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index()
    {
        $reservation = Reservation::with("table")->orderByDesc("id_reservation")->paginate(7);
        return response()->json($reservation);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "id_user" => "required|exists:users,id",
            "id_table" => "required|exists:tables,id",
            "date" => "required|string",
            "menu" => "required|string",
            "payment" => "required|string",
        ]);

        $reservation = Reservation::create([
            ...$validated,
            "status" => $request->input("status", "en attente"),
        ]);

        return response()->json([
            "message" => "Create avec success",
            "Reservation" => $reservation
        ]);
    }

    public function show(Reservation $reservation, $id)
    {
        $reservation = Reservation::find($id);
        return response()->json($reservation);
    }

    public function update(Request $request, $id)
    {
        $reservation = Reservation::find($id);
        $validated = $request->validate([
            "id_user" => "required|exists:users,id",
            "id_table" => "required|exists:tables,id",
            "date" => "required|string",
            "menu" => "required|string",
            "payment" => "required|string",
        ]);

        $reservation->update([
            ...$validated,
            "status" => $request->input("status", $reservation->status),
        ]);

        return response()->json([
            "message" => "update avec success",
            "Reservation" => $reservation
        ]);
    }

    public function destroy(Reservation $reservation, $id)
    {
        Reservation::destroy($id);
        return response()->json([
            "message" => "supprimer avec success"
        ]);
    }

    public function validereservation(Reservation $reservation, $id)
    {
        $reservation = Reservation::find($id);
        if (!$reservation) {
            return response()->json(["message" => "reservation non trouver"], 404);
        }

        $table = Table::find($reservation->id_table);
        if (!$table) {
            return response()->json(["message" => "Table non trouver"], 404);
        }

        $table->update(["status" => "0"]);
        $reservation->update(["status" => "confirmée"]);

        return response()->json([
            "message" => "Le status modifier avec success",
            "reservation" => $reservation
        ]);
    }

    public function annullerreservation(Reservation $reservation, $id)
    {
        $reservation = Reservation::find($id);
        if (!$reservation) {
            return response()->json(["message" => "reservation non trouver"], 404);
        }

        $table = Table::find($reservation->id_table);
        if ($table) {
            $table->update(["status" => "1"]);
        }

        $reservation->update(["status" => "annulée"]);

        return response()->json([
            "message" => "Le status modifiee avec success",
            "reservation" => $reservation
        ]);
    }

    public function etattable(Reservation $reservation)
    {
        $table = Table::where("status", "1")->get();
        return response()->json($table);
    }

    public function updateetattable(Request $request, $id)
    {
        $reservation = Reservation::find($id);
        if (!$reservation) {
            return response()->json(["message" => "Reservation non trouver"], 404);
        }

        $reservation->update(["id_table" => $request->id_table]);

        return response()->json(["message" => "table de reservation et modifier"]);
    }

    public function nombrestatic(Reservation $reservation)
    {
        $reservation = Reservation::count();
        $orders = Order::count();
        $livruer = Livreur::count();
        $livrison = Livrison::where("status", "livree")->count();

        return response()->json([
            "reservation" => $reservation,
            "orders" => $orders,
            "livreur" => $livruer,
            "livrison" => $livrison
        ]);
    }
}
