# 🚀 EVIVI_API_SPECIFICATION.md

**Version :** 1.0.0  
**Date :** 01 Février 2026  
**Auteur :** Agent d'Ingénierie Logicielle (IA) pour **Hypee**  
**Statut :** Validé pour implémentation

---

## 📑 Sommaire

1. [Présentation de la solution Evivi](#1-présentation-de-la-solution-evivi)
2. [Inventaire exhaustif des fonctionnalités](#2-inventaire-exhaustif-des-fonctionnalités)
3. [Spécifications API par fonctionnalité](#3-spécifications-api-par-fonctionnalité)
4. [Modèles de données Django recommandés](#4-modèles-de-données-django-recommandés)
5. [Flux globaux du système](#5-flux-globaux-du-système)
6. [Architecture API REST Django proposée](#6-architecture-api-rest-django-proposée)
7. [Recommandations backend](#7-recommandations-backend)
8. [Annexes techniques](#8-annexes-techniques)

---

## 1. Présentation de la solution Evivi

**Evivi** est une application web mobile-first développée par **Hypee**, dédiée au partage et à la découverte de recettes culinaires, avec un focus particulier sur la richesse des saveurs (notamment ouest-africaines, comme suggéré par le contenu actuel).

### 🎯 Problématique & Solution
Les plateformes de recettes traditionnelles sont souvent statiques. **Evivi** se positionne comme un **réseau social culinaire** dynamique ("Social Cooking"). Elle permet non seulement de consommer du contenu (recettes) mais aussi de partager des instants de cuisine éphémères ("Kitchen Moments" / Stories) et d'interagir directement avec une communauté de chefs et d'amateurs.

### 🏗️ Architecture Globale
*   **Frontend :** Application React/Vite (SPA) avec une UX "app-like" très riche (animations Framer Motion, transitions fluides).
*   **API :** Interface RESTful Django qui servira de cerveau à l'application.
*   **Base de données :** Relationnelle (PostgreSQL recommandé) pour gérer les relations sociales et les contenus structurés.

---

## 2. Inventaire exhaustif des fonctionnalités

Voici la liste des fonctionnalités extraites de l'analyse du code frontend fourni par **Hypee**.

### 🔐 Authentification & Compte
*   **Inscription (Register) :** Création de compte avec email, nom d'utilisateur et mot de passe.
*   **Connexion (Login) :** Authentification sécurisée (Token JWT).
*   **Gestion de profil (Edit Profile) :** Modification de l'avatar, bio, statut professionnel (Chef, Foodie...), localisation.

### 📱 Fil d'actualité (Feed) & Social
*   **Feed Global & Abonnements :** Double vue pour voir les recettes de tout le monde ou seulement des chefs suivis.
*   **Kitchen Moments (Stories) :** Création et visualisation de contenus éphémères (photos/vidéos) style Instagram.
*   **Recommandations de Chefs :** Carrousel horizontal suggérant des profils à suivre.
*   **Système de Follow :** Suivre/Ne plus suivre d'autres utilisateurs.

### 🍳 Gestion des Recettes
*   **Création de Recette (Wizard) :** Formulaire complet par étapes (Titre, Images, Ingrédients, Étapes, Temps, Parts).
*   **Consultation (Detail) :** Vue détaillée d'une recette.
*   **Interaction :** Like, Commentaire (via un Sheet modal), Enregistrement (Bookmark).

### 🔍 Découverte (Discover)
*   **Recherche :** Recherche textuelle de recettes ou d'ingrédients.
*   **Filtres par Catégorie :** Tags (ex: West African, Vegan, Spicy...).
*   **Tendances :** Mise en avant des recettes populaires ("Featured Feed").

### 🔔 Activité
*   **Notifications :** Historique des interactions (J'aime, Commentaires, Nouveaux abonnés) groupé par temporalité (Aujourd'hui, Hier...).

---

## 3. Spécifications API par fonctionnalité

### A. Authentification (Auth)

#### 1. Inscription
*   **Endpoint :** `/api/auth/register/`
*   **Méthode :** `POST`
*   **Payload :**
    ```json
    {
      "email": "user@example.com",
      "username": "chef_moussa",
      "password": "securePassword123"
    }
    ```
*   **Réponse (201 Created) :**
    ```json
    {
      "user": { "id": 1, "username": "chef_moussa", ... },
      "token": "access_token_jwt..."
    }
    ```

#### 2. Connexion
*   **Endpoint :** `/api/auth/login/`
*   **Méthode :** `POST`
*   **Payload :** `{ "username": "chef_moussa", "password": "..." }`
*   **Réponse (200 OK) :** `{ "token": "...", "user": {...} }`

---

### B. Gestion des Utilisateurs (Users)

#### 1. Récupérer le profil courant
*   **Endpoint :** `/api/auth/me/`
*   **Méthode :** `GET`
*   **Réponse (200 OK) :** Objet `User` complet.

#### 2. Mettre à jour son profil
*   **Endpoint :** `/api/auth/me/`
*   **Méthode :** `PATCH`
*   **Support :** `multipart/form-data` (pour l'avatar).
*   **Payload :**
    *   `avatar`: (Fichier image, optionnel)
    *   `bio`: (String)
    *   `country`: (String)
    *   `professional_status`: (JSON Array ou liste de Strings, ex: `["Chef", "Blogger"]`)
*   **Réponse (200 OK) :** Objet `User` mis à jour.

#### 3. Voir le profil d'un autre utilisateur
*   **Endpoint :** `/api/users/{username}/`
*   **Méthode :** `GET`
*   **Réponse (200 OK) :**
    ```json
    {
      "id": 5,
      "username": "fatou_cooks",
      "avatar": "url...",
      "bio": "...",
      "stats": {
        "followers": 1200,
        "following": 50,
        "recipes": 12
      },
      "is_following": false
    }
    ```

#### 4. Suivre / Ne plus suivre
*   **Endpoint :** `/api/users/{id}/follow/`
*   **Méthode :** `POST` (Toggle ou POST/DELETE séparés).
*   **Réponse (200 OK) :** `{ "following": true }`

#### 5. Recommandations de Chefs
*   **Endpoint :** `/api/users/recommendations/`
*   **Méthode :** `GET`
*   **Logique :** Retourner des utilisateurs populaires ou pertinents non suivis par l'utilisateur courant.
*   **Réponse (200 OK) :** Liste d'objets `User`.

---

### C. Recettes (Recipes)

#### 1. Créer une recette
*   **Endpoint :** `/api/recipes/`
*   **Méthode :** `POST`
*   **Support :** `multipart/form-data` (car upload multiple d'images possible).
*   **Payload :**
    *   `title`: "Jollof Rice"
    *   `description`: "..."
    *   `images`: [Fichier1, Fichier2...]
    *   `ingredients`: JSON String `[{"name":"Riz", "amount":"500g"}, ...]`
    *   `steps`: JSON String `["Laver le riz", "Cuire la tomate..."]`
    *   `cooking_time`: "45 mins"
    *   `servings`: "4"
*   **Réponse (201 Created) :** Objet `Recipe` créé.

#### 2. Fil d'actualité (Feed)
*   **Endpoint :** `/api/recipes/feed/`
*   **Méthode :** `GET`
*   **Paramètres :**
    *   `scope`: `global` (par défaut) ou `following`.
    *   `page`: Pagination.
*   **Réponse (200 OK) :** Liste paginée d'objets `Recipe`.

#### 3. Détail d'une recette
*   **Endpoint :** `/api/recipes/{id}/`
*   **Méthode :** `GET`
*   **Réponse (200 OK) :** Objet `Recipe` complet incluant `author`, `ingredients`, `steps`, `is_liked`, `is_saved`.

#### 4. Recettes d'un utilisateur (Profil)
*   **Endpoint :** `/api/users/{username}/recipes/`
*   **Méthode :** `GET`
*   **Réponse (200 OK) :** Liste des recettes de l'utilisateur.

#### 5. Liker une recette
*   **Endpoint :** `/api/recipes/{id}/like/`
*   **Méthode :** `POST` / `DELETE`
*   **Réponse (200 OK) :** `{ "likes_count": 15, "is_liked": true }`

#### 6. Commenter une recette
*   **Endpoint :** `/api/recipes/{id}/comments/`
*   **Méthode :** `GET` (Liste) / `POST` (Ajout)
*   **Payload POST :** `{ "content": "Super recette !" }`
*   **Réponse (201 Created) :** Objet `Comment`.

---

### D. Stories (Kitchen Moments)

#### 1. Créer une story
*   **Endpoint :** `/api/stories/`
*   **Méthode :** `POST`
*   **Support :** `multipart/form-data`
*   **Payload :**
    *   `media`: Fichier (Image ou Vidéo).
    *   `caption`: Texte.
    *   `font_style` & `font_color`: Métadonnées de style.
*   **Réponse (201 Created) :** Objet `Story`.

#### 2. Récupérer les stories actives
*   **Endpoint :** `/api/stories/feed/`
*   **Méthode :** `GET`
*   **Logique :** Retourne les stories des dernières 24h, groupées par utilisateur.
*   **Réponse (200 OK) :**
    ```json
    [
      {
        "user": { ... },
        "stories": [ { "id": 1, "media": "...", "created_at": "..." } ]
      }
    ]
    ```

---

### E. Découverte (Discover)

#### 1. Recherche et Filtrage
*   **Endpoint :** `/api/recipes/search/`
*   **Méthode :** `GET`
*   **Paramètres :**
    *   `q`: Terme de recherche (titre/ingrédient).
    *   `category`: Filtre (ex: "Vegan").
*   **Réponse (200 OK) :** Liste de résultats `Recipe`.

---

### F. Notifications

#### 1. Liste des notifications
*   **Endpoint :** `/api/notifications/`
*   **Méthode :** `GET`
*   **Réponse (200 OK) :**
    ```json
    [
      {
        "id": 1,
        "type": "like", // users_follow, recipe_like, recipe_comment
        "actor": { "username": "..." },
        "target_recipe": { "id": 10, "title": "..." }, // null si type=follow
        "created_at": "2026-02-01T10:00:00Z"
      }
    ]
    ```

---

## 4. Modèles de données Django recommandés

### **1. User (AbstractUser)**
Extension du modèle de base Django.
*   `bio` (TextField, null=True)
*   `avatar` (ImageField, null=True)
*   `country` (CharField)
*   `professional_status` (JSONField): Pour stocker les tags multiples (Chef, Foodie...).
*   `followers` (ManyToMany vers `self`, symmetrical=False).

### **2. Recipe**
Le cœur du contenu.
*   `author` (ForeignKey -> User)
*   `title` (CharField)
*   `description` (TextField)
*   `cooking_time` (CharField)
*   `servings` (CharField)
*   `created_at` (DateTime, auto_now_add)
*   `updated_at` (DateTime, auto_now)
*   `category` (CharField/ForeignKey): Pour le classement "Discover".

### **3. RecipeImage**
Pour gérer plusieurs images par recette.
*   `recipe` (ForeignKey -> Recipe)
*   `image` (ImageField)
*   `order` (Integer, default=0)

### **4. Ingredient**
*   `recipe` (ForeignKey -> Recipe)
*   `name` (CharField)
*   `amount` (CharField)

### **5. PreparationStep**
*   `recipe` (ForeignKey -> Recipe)
*   `text` (TextField)
*   `order` (Integer)

### **6. Comment**
*   `user` (ForeignKey -> User)
*   `recipe` (ForeignKey -> Recipe)
*   `content` (TextField)
*   `created_at` (DateTime)

### **7. Like** & **SavedRecipe**
Peuvent être gérés via des tables de liaison ManyToMany sur le modèle `Recipe` ou des modèles dédiés (`RecipeLike`, `RecipeSave`).

### **8. Story**
*   `author` (ForeignKey -> User)
*   `media` (FileField): Image ou Vidéo.
*   `media_type` (Choice: IMAGE, VIDEO)
*   `caption` (TextField, blank=True)
*   `styles` (JSONField): Stocke font, couleur, position.
*   `created_at` (DateTime)
*   `expires_at` (DateTime): Calculé à `created_at + 24h`.

### **9. Notification**
*   `recipient` (ForeignKey -> User)
*   `actor` (ForeignKey -> User)
*   `verb` (Choice: LIKE, FOLLOW, COMMENT)
*   `target_content_type` (GenericForeignKey): Pour pointer vers une Recette ou autre.
*   `is_read` (Boolean)

---

## 5. Flux globaux du système

### Authentification & Sécurité
*   Utiliser **JWT** (JSON Web Tokens) via `djangorestframework-simplejwt`.
*   Le token doit être présent dans le header `Authorization: Bearer <token>` pour toutes les requêtes sauf Auth.
*   Permissions :
    *   `IsAuthenticated` pour créer du contenu, liker, commenter.
    *   `IsOwnerOrReadOnly` pour modifier/supprimer une recette ou un profil.

### Gestion des Médias
*   Le frontend envoie les fichiers (images/vidéos) via `multipart/form-data`.
*   Le backend (Django) doit gérer le stockage (S3 recommandé en PROD, `media/` folder en DEV).

---

## 6. Architecture API REST Django proposée

### Structure des dossiers (Applications)
Découper le projet en "apps" Django logiques pour maintenir un code propre :

```text
backend/
├── manage.py
├── core/               # Settings globaux
├── users/              # Auth, Profils, Follows
├── recipes/            # Recettes, Ingrédient, Steps, Commentaires, Likes, Catégories
├── stories/            # Gestion des Stories éphémères
└── notifications/      # Système de notifications
```

### Standards de réponse API
Toujours renvoyer du JSON. En cas d'erreur :
```json
{
  "code": "validation_error",
  "message": "Le champ titre est requis.",
  "details": { "title": ["Ce champ est obligatoire."] }
}
```

---

## 7. Recommandations backend

1.  **Performance des images :** Utilisez une librairie comme `easy-thumbnails` ou un traitement coté serveur pour redimensionner les images uploadées. Le frontend est très visuel, des images de 10Mo ralentiront l'app.
2.  **Pagination :** Indispensable pour `/feed/` et `/recipes/search/`. Utilisez `LimitOffsetPagination` ou `PageNumberPagination` de DRF.
3.  **Filtrage :** Utilisez `django-filter` pour simplifier la création des filtres de recherche (ingrédients, temps de cuisson, etc.).
4.  **Optimisation SQL :** Utilisez `select_related` (pour author) et `prefetch_related` (pour images, ingredients, comments) dans vos ViewSets pour éviter le problème "N+1 queries", surtout sur le Feed.

---

## 8. Annexes techniques

### Dépendances suggérées (`requirements.txt`)
*   `Django>=5.0`
*   `djangorestframework`
*   `djangorestframework-simplejwt`
*   `django-cors-headers` (Indispensable pour que le frontend React communique avec l'API)
*   `django-filter`
*   `Pillow` (Gestion images)
*   `drf-yasg` ou `drf-spectacular` (Pour générer un Swagger/OpenAPI auto-documenté).

---

**Fin du document de spécification.**
Document généré pour **Hypee** - Solution **Evivi**.
