# Smart Restaurant Management System (SRMS)

Ce dépôt contient une application web full-stack pour la gestion de restaurants (backend Laravel + frontend React) et une évolution en plateforme SaaS multi-restaurants.

Ce README rassemble les informations utiles pour installer, configurer et dépanner le projet.

## Technologie

- Backend: Laravel 10, PHP 8.2, MySQL
- Frontend: React (Create React App), TailwindCSS
- Auth: Laravel Sanctum
- Infrastructure: Docker / docker-compose (fichiers fournis)

## Structure du dépôt

- `Back-end/` : code Laravel (API, migrations, seeders)
- `front-end/` : application React
- `docker-compose.yaml` : définition des services (backend, frontend, mysql, phpmyadmin)

## Prérequis

- Docker & Docker Compose (recommandé) ou PHP, Composer, MySQL, Node.js / npm installés localement

## Installation (Docker)

1. Depuis la racine du projet (là où se trouve `docker-compose.yaml`) :

```bash
docker compose up -d --build
```

2. Appliquer les migrations et seeders (si nécessaire) :

```bash
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --class=AdminUserSeeder
```

3. Vider le cache Laravel si vous changez `.env` :

```bash
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan route:clear
```

## Installation (développement local sans Docker)

Backend :

```bash
cd Back-end
composer install
cp .env.example .env
php artisan key:generate
# configurer .env (DB_* etc.)
php artisan migrate
php artisan db:seed --class=AdminUserSeeder
php artisan serve --host=127.0.0.1 --port=8000
```

Frontend :

```bash
cd front-end
npm install
npm start
```

## Variables d'environnement importantes

- `DB_HOST` : si vous exécutez localement (sans Docker) mettez `DB_HOST=127.0.0.1`. Si vous utilisez Docker, utilisez le nom du service MySQL défini dans `docker-compose.yaml` (souvent `mysql`).
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` : base de données config
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` : utilisés par `Database\\Seeders\\AdminUserSeeder` pour créer un compte administrateur si inexistant. Exemples dans `Back-end/.env` :

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
```

Le seeder crée l'utilisateur admin uniquement s'il n'existe pas. Pour modifier un admin déjà présent, voir la section « Mettre à jour l'admin existant ».

## Créer / Mettre à jour l'administrateur

Option A — (re)créer via le seeder : éditez `Back-end/.env` pour définir `ADMIN_EMAIL` et `ADMIN_PASSWORD`, puis exécutez :

```bash
cd Back-end
php artisan db:seed --class=AdminUserSeeder
```

Note : le seeder ne remplace pas un utilisateur existant avec le même email.

Option B — mettre à jour un admin existant (recommandé si l'admin existe déjà) :

```bash
cd Back-end
php artisan tinker

# Dans Tinker
$user = App\\Models\\User::where('email', 'admin@example.com')->first();
$user->email = 'nouvel@exemple.com';
$user->password = Hash::make('NouveauMotDePasse123!');
$user->save();
```

Option C — via SQL :

1. Générez un hash Bcrypt localement :

```bash
php -r "echo password_hash('NouveauMotDePasse123!', PASSWORD_BCRYPT).PHP_EOL;"
```

2. Puis mettez à jour la table `users` :

```sql
UPDATE users SET email='nouvel@exemple.com', password='[HASH]' WHERE email='admin@example.com';
```

## Commandes utiles

- Lancer les migrations : `php artisan migrate`
- Exécuter les seeders : `php artisan db:seed --class=AdminUserSeeder`
- Vider le cache config : `php artisan config:clear`
- Démarrer le frontend (dev) : `cd front-end && npm start`

## Dépannage fréquent

- Erreur de connexion à la base (ex: "getaddrinfo for mysql failed") : vérifiez `DB_HOST` dans `Back-end/.env`. Si vous êtes en local sans Docker, remplacez `DB_HOST=mysql` par `DB_HOST=127.0.0.1` puis exécutez :

```bash
php artisan config:clear
php artisan cache:clear
```

- Si vous utilisez Docker, assurez-vous que le service MySQL est démarré et que `DB_HOST` correspond au nom du service (ex: `mysql`).

- Seeder admin ne crée pas d'utilisateur : le seeder vérifie si un utilisateur avec cet email existe déjà. Si vous voulez forcer la mise à jour du mot de passe, utilisez Tinker.

## Endpoints API (exemples)

- `POST /api/login`
- `POST /api/register`
- `POST /api/logout`
- `GET /api/user`

## Frontend

Le frontend est une application Create React App dans `front-end/`. Pour développer :

```bash
cd front-end
npm install
npm start
```

## Informations supplémentaires

Consultez `Back-end/README.md` pour des informations générales sur Laravel et `front-end/README.md` pour les commandes Create React App.

---

Si vous voulez, je peux :
- mettre `DB_HOST=127.0.0.1` dans `Back-end/.env` (si vous êtes en local),
- ajouter `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans `Back-end/.env`,
- ou exécuter les commandes `php artisan` (vous devrez lancer ces commandes dans votre terminal local).

  "password": "password"
}
```

Inscription client:

```json
{
  "name": "Client Demo",
  "email": "client@test.com",
  "password": "password",
  "password_confirmation": "password"
}
```

Le projet utilise Laravel Sanctum pour retourner un token API.

## Routes Frontend

Routes publiques:

```text
/
/login
/register
/menu
/restaurants
/restaurant/:slug
/feedback
/contact
/about
/local
```

Routes admin:

```text
/user/admin
/user/admin/dashboard
/user/admin/rapports
/user/admin/ventes
/user/admin/profile
/user/admin/feedbacks
/user/admin/reclamations
/user/admin/fournisseur
/user/admin/stock
/user/admin/servants
/user/admin/tables
/user/admin/categories
/user/admin/menus
/user/admin/reservations
/user/admin/orders
/user/admin/livrisons
/user/admin/livreurs
```

Routes client:

```text
/user/client
/user/client/reclamation
/user/client/avis
/user/client/reservation
/user/client/commande
/user/client/commandes
/user/client/profile
```

Routes servant:

```text
/user/servant
/user/servant/profil
/user/servant/tables
/user/servant/menu
/user/servant/commandes-locales
/user/servant/commandes-en-ligne
/user/servant/livraisons
/user/servant/reservations
```

Routes livreur:

```text
/user/livreur
/user/livreur/profile
/user/livreur/status
/user/livreur/livrisons
/user/livreur/historique
/user/livreur/menu
```

## Routes API Principales

Base URL:

```text
http://localhost:8000/api
```

### SaaS Restaurants

```http
GET /restaurants
POST /restaurants
GET /restaurants/nearby
GET /restaurants/{slug}
PUT /restaurants/{restaurant}
DELETE /restaurants/{restaurant}
GET /restaurants/{restaurant}/menus
GET /restaurants/{restaurant}/reviews
POST /restaurants/{restaurant}/reviews
GET /restaurants/{restaurant}/dashboard
```

### Recherche

```http
GET /search
```

### Anciennes Ressources

```http
GET /categories
POST /categories
GET /categories/{id}
PUT /categories/{id}
DELETE /categories/{id}

GET /menus
POST /menus
GET /menus/{id}
PUT /menus/{id}
DELETE /menus/{id}

GET /orders
POST /orders
GET /orders/{id}
PUT /orders/{id}
DELETE /orders/{id}

GET /reservations
POST /reservations
GET /reservations/{id}
PUT /reservations/{id}
DELETE /reservations/{id}

GET /livreurs
POST /livreurs
GET /livrisons
POST /livrisons
GET /servants
POST /servants
GET /tables
POST /tables
GET /sales
POST /sales
```

Autres endpoints existants:

```http
GET /menu
GET /menu/category
PUT /tables/{id}/status
POST /report
POST /export-sales
GET /feedback
POST /feedback
GET /reclamations
POST /reclamations
GET /stocks
POST /stocks
GET /fournisseurs
POST /fournisseurs
GET /orders/user/{id}
PUT /orderstatus/{id}
GET /getLivreurActif
PUT /updateStatus/{id}
GET /nombrestatic
```

## Exemples API

### Creer Un Restaurant

```json
POST /api/restaurants
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "nom": "Pizza Casa",
  "slug": "pizza-casa",
  "description": "Pizzas artisanales et plats italiens",
  "ville": "Casablanca",
  "adresse": "Maarif, Casablanca",
  "telephone": "0600000000",
  "email": "contact@pizzacasa.test",
  "type_cuisine": "italien",
  "status": "active",
  "abonnement_plan": "basic",
  "latitude": 33.5731,
  "longitude": -7.5898,
  "delivery_available": true,
  "is_halal": true,
  "is_vegetarian_friendly": true,
  "minimum_order_price": 50
}
```

### Ajouter Une Categorie Restaurant

```json
POST /api/categories
Content-Type: application/json

{
  "title": "Pizza",
  "slug": "pizza",
  "restaurant_id": 1
}
```

### Ajouter Un Menu Restaurant

```bash
curl -X POST "http://localhost:8000/api/menus" \
  -F "title=Pizza Margherita" \
  -F "slug=pizza-margherita" \
  -F "description=Tomate, mozzarella, basilic" \
  -F "price=55" \
  -F "category_id=1" \
  -F "restaurant_id=1" \
  -F "is_available=1" \
  -F "image=@C:/chemin/image.jpg"
```

### Rechercher

```http
GET /api/search?q=pizza
GET /api/search?q=asiatique
GET /api/search?q=sushi&ville=Casablanca
```

### Restaurants Proches

```http
GET /api/restaurants/nearby?lat=33.5731&lng=-7.5898&radius=20
```

### Ajouter Un Avis Restaurant

```json
POST /api/restaurants/1/reviews
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent restaurant."
}
```

## Creer Un Admin De Test

Dans phpMyAdmin, ouvrir la base `restaurant_db`, puis executer:

```sql
INSERT INTO users (name, email, role, password, created_at, updated_at)
VALUES (
  'Admin',
  'admin@test.com',
  'admin',
  '$2y$12$Vh6GVGKZMkYuwZ3ojtO3FeWw0TjjDOebt1JTbQJ1KnV7cDDVzE6XS',
  NOW(),
  NOW()
);
```

Identifiants:

```text
Email: admin@test.com
Mot de passe: password
```

## Ajouter Un Restaurant De Test

Dans phpMyAdmin:

```sql
INSERT INTO restaurants
(nom, slug, description, ville, type_cuisine, status, abonnement_plan, delivery_available, is_halal, is_vegetarian_friendly, latitude, longitude, created_at, updated_at)
VALUES
('Pizza Casa', 'pizza-casa', 'Pizzas artisanales et plats italiens', 'Casablanca', 'italien', 'active', 'basic', 1, 1, 1, 33.5731, -7.5898, NOW(), NOW());
```

Puis ouvrir:

```text
http://localhost:3000/restaurants
http://localhost:3000/restaurant/pizza-casa
```

## Depannage

### Docker Compose Ne Trouve Pas Le Fichier

Erreur:

```text
no configuration file provided: not found
```

Solution:

```cmd
cd "C:\Users\PC\Downloads\Smart-restaurant-management-system-PFE-main (3)\Smart-restaurant-management-system-PFE-main"
docker compose up -d --build
```

### Docker Access Denied

Erreur:

```text
permission denied while trying to connect to the docker API
Access is denied
```

Solutions:

1. Ouvrir Docker Desktop.
2. Ouvrir le terminal en administrateur.
3. Ajouter l'utilisateur Windows au groupe Docker:

```cmd
net localgroup docker-users PC /add
```

4. Redemarrer le PC.

### Erreur De Connexion Dans Le Frontend

Verifier:

```cmd
docker compose ps
docker compose logs -f backend
```

Vider les caches:

```cmd
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:clear
docker compose exec backend php artisan cache:clear
```

Verifier que les utilisateurs existent:

```sql
SELECT id, name, email, role FROM users;
SELECT id, name, email FROM servants;
SELECT id_livreur, nom, prenom, email FROM livreurs;
```

### La Page Restaurants Est Vide

Il faut ajouter des restaurants dans la table `restaurants`.

Verifier:

```sql
SELECT id, nom, slug, ville, type_cuisine, status FROM restaurants;
```

Le champ `status` doit etre:

```text
active
```

### Apres Modification Du Code

Relancer:

```cmd
docker compose down
docker compose up -d --build
docker compose exec backend php artisan migrate
```

## Structure Du Projet

```text
Smart-restaurant-management-system-PFE-main
|
|-- Back-end
|   |-- app
|   |-- database
|   |-- routes
|   |-- config
|   |-- public
|
|-- front-end
|   |-- src
|   |-- public
|
|-- docker-compose.yaml
|-- README.md
```

## Etat Actuel

Fonctionnel:
- ancien systeme SRMS
- authentification existante
- gestion restaurant classique
- API SaaS restaurants
- recherche globale
- page publique restaurants
- reviews restaurants
- geolocalisation restaurants proches
- tables abonnements SaaS
- frontend marketplace `/restaurants`

A continuer:
- securiser toutes les anciennes routes API avec RBAC backend
- ajouter paiement SaaS reel
- ajouter dashboard owner complet
- ajouter seeders pour plans Basic/Premium/Enterprise
- ajouter tests automatiques
- importer ou migrer les anciennes donnees vers `restaurant_id`

## Auteur

Projet PFE developpe par Achraf.

Extension SaaS ajoutee sur le projet SRMS existant.
