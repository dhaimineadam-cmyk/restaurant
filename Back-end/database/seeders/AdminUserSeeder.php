<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@example.com');
        $password = env('ADMIN_PASSWORD', 'Admin123!');

        $user = User::where('email', $email)->first();

        if (! $user) {
            User::create([
                'name' => 'Administrator',
                'email' => $email,
                'role' => 'admin',
                'password' => Hash::make($password),
            ]);
        }
    }
}
