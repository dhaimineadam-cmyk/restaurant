# Smart Restaurant Management System - SRMS SaaS

SRMS est une application web full-stack pour la gestion de restaurants. Le projet original permettait de gerer un seul restaurant. Il a ete etendu pour devenir une plateforme SaaS multi-restaurants, tout en gardant les anciennes fonctionnalites.

## Stack Technique

Backend:
- Laravel 10
- PHP 8.2
- MySQL 8
- Laravel Sanctum
- API REST

Frontend:
- React
- React Router
- Axios
- TailwindCSS
- Bootstrap
- Lucide React

Infrastructure:
- Docker
- Docker Compose
- MySQL
- phpMyAdmin

## Objectif Du Projet

Le projet permet maintenant deux types d'utilisation:

1. Gestion restaurant classique:
- gestion des menus
- gestion des categories
- gestion des tables
- gestion des reservations
- gestion des commandes
- gestion des livraisons
- gestion des livreurs
- gestion des servants
- gestion des stocks
- gestion des fournisseurs
- gestion des ventes
- gestion des reclamations
- gestion des feedbacks
- generation de rapports

2. Plateforme SaaS multi-restaurants:
- plusieurs restaurants sur la meme plateforme
- page publique pour chaque restaurant
- recherche globale de restaurants, plats et categories
- filtres avances
- notes et avis
- geolocalisation
- dashboard restaurant
- systeme d'abonnements SaaS

## Roles Utilisateurs

Le projet gere les roles suivants:

| Role | Description |
|---|---|
| admin | Gestion complete de la plateforme et du restaurant |
| owner | Proprietaire d'un restaurant SaaS |
| client | Consultation menus, commandes, reservations, avis |
| servant | Gestion operationnelle des tables, commandes et reservations |
| livreur | Gestion des livraisons et statut de disponibilite |

## Anciennes Fonctionnalites Conservees

Les fonctionnalites existantes du projet SRMS sont conservees:

- authentification admin, client, servant et livreur
- dashboard admin
- menu restaurant
- categories
- tables
- commandes locales
- commandes en ligne
- reservations
- livraisons
- livreurs
- servants
- stocks
- fournisseurs
- ventes
- rapports
- reclamations
- feedbacks
- paiement
- profil utilisateur
- carte/localisation

## Nouvelles Fonctionnalites SaaS

### Multi-Restaurant

Nouvelle table:

```text
restaurants
```

Champs principaux:
- id
- owner_id
- nom
- slug
- description
- logo
- banner
- adresse
- ville
- telephone
- email
- type_cuisine
- horaires
- status
- abonnement_plan
- latitude
- longitude
- delivery_available
- is_halal
- is_vegetarian_friendly
- minimum_order_price

Les tables suivantes peuvent maintenant etre reliees a un restaurant avec `restaurant_id`:
- menus
- categories
- orders
- reservations
- stocks
- fournisseurs
- livreurs
- servants
- sales
- tables
- users

Les champs sont nullable pour ne pas casser les anciennes donnees.

### Recherche Intelligente

Endpoint:

```http
GET /api/search?q=pizza
```

La recherche retourne:
- restaurants
- menus
- categories

Filtres disponibles:
- ville
- cuisine
- prix min
- prix max
- note minimum
- disponibilite
- livraison disponible
- halal
- vegetarien

Exemples:

```http
GET /api/search?q=pizza
GET /api/search?q=sushi&ville=Casablanca
GET /api/search?cuisine=italien&delivery=1
GET /api/search?min_price=20&max_price=100&available=1
```

### Pages Publiques Restaurants

Frontend:

```text
/restaurants
/restaurant/:slug
```

Exemples:

```text
http://localhost:3000/restaurants
http://localhost:3000/restaurant/pizza-casa
```

La page publique affiche:
- logo
- banniere
- description
- ville
- cuisine
- categories
- menus
- note moyenne
- nombre d'avis
- livraison disponible
- adresse

### Avis Et Notes

Nouvelles tables:

```text
restaurant_reviews
menu_reviews
```

Les avis restaurant contiennent:
- user_id
- restaurant_id
- rating
- comment

Les avis menu contiennent:
- user_id
- menu_id
- restaurant_id
- rating
- comment

### Geolocalisation

Les restaurants ont maintenant:
- latitude
- longitude

Endpoint:

```http
GET /api/restaurants/nearby?lat=33.5731&lng=-7.5898&radius=20
```

### Abonnements SaaS

Nouvelles tables:

```text
plans
subscriptions
payments
```

Plans prevus:
- Basic
- Premium
- Enterprise

## Architecture

```text
Navigateur
   |
   v
Frontend React
   |
   v
Laravel API REST
   |
   v
MySQL
   |
   v
phpMyAdmin
```

Ports Docker:

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| phpMyAdmin | http://localhost:8081 |
| MySQL | localhost:3306 |

## Installation Avec Docker

Ouvrir un terminal dans le dossier qui contient `docker-compose.yaml`:

```cmd
cd "C:\Users\PC\Downloads\Smart-restaurant-management-system-PFE-main (3)\Smart-restaurant-management-system-PFE-main"
```

Lancer le projet:

```cmd
docker compose up -d --build
```

Voir les conteneurs:

```cmd
docker compose ps
```

Appliquer les migrations:

```cmd
docker compose exec backend php artisan migrate
```

Vider les caches Laravel:

```cmd
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:clear
docker compose exec backend php artisan cache:clear
```

Arreter le projet:

```cmd
docker compose down
```

Voir les logs:

```cmd
docker compose logs -f
```

Voir les logs backend uniquement:

```cmd
docker compose logs -f backend
```

## phpMyAdmin

URL:

```text
http://localhost:8081
```

Connexion root:

```text
Serveur: mysql
Utilisateur: root
Mot de passe: root
```

Connexion utilisateur application:

```text
Serveur: mysql
Utilisateur: restaurant_user
Mot de passe: restaurant_pass
Base de donnees: restaurant_db
```

## Installation Sans Docker

Backend:

```cmd
cd Back-end
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

Frontend:

```cmd
cd front-end
npm install
npm start
```

URL:

```text
Frontend: http://localhost:3000
Backend: http://localhost:8000
```

## Authentification

Endpoints:

```http
POST /api/login
POST /api/register
POST /api/logout
GET /api/user
```

Connexion:

```json
{
  "email": "admin@test.com",
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
