<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Livreur;
use App\Models\Servants;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            $user = Auth::user();
            $token = $user->createToken('user-token')->plainTextToken;

            Log::info('Connexion user reussie', ['user_id' => $user->id, 'role' => $user->role]);

            return response()->json([
                'message' => 'Connexion reussie',
                'user' => $user,
                'token' => $token,
            ], 200);
        }

        $servant = Servants::where('email', $credentials['email'])->first();
        if ($servant && Hash::check($credentials['password'], $servant->password)) {
            auth('servants')->login($servant);
            $token = $servant->createToken('servant-token')->plainTextToken;

            Log::info('Connexion servant reussie', ['servant_id' => $servant->id]);

            return response()->json([
                'message' => 'Connexion reussie',
                'user' => [
                    'id' => $servant->id,
                    'name' => $servant->name,
                    'email' => $servant->email,
                    'role' => 'servant',
                ],
                'token' => $token,
            ], 200);
        }

        $livreur = Livreur::where('email', $credentials['email'])->first();
        if ($livreur && Hash::check($credentials['password'], $livreur->password)) {
            $token = $livreur->createToken('livreur-token')->plainTextToken;

            Log::info('Connexion livreur reussie', ['livreur_id' => $livreur->id_livreur]);

            return response()->json([
                'message' => 'Connexion reussie',
                'user' => [
                    'id' => $livreur->id_livreur,
                    'name' => $livreur->nom . ' ' . $livreur->prenom,
                    'email' => $livreur->email,
                    'role' => 'livreur',
                ],
                'token' => $token,
            ], 200);
        }

        throw ValidationException::withMessages([
            'email' => ['Les identifiants fournis sont incorrects.'],
        ]);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', 'min:8'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'client',
        ]);

        Auth::login($user);

        return response()->json([
            'message' => 'Inscription reussie',
            'user' => $user,
            'token' => $user->createToken('user-token')->plainTextToken,
        ], 201);
    }
}
