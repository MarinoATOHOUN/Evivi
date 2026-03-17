# Documentation API Evivi

## Vue d'ensemble

Cette documentation détaille tous les endpoints de l'API REST Evivi.

## Base URL

```
Development: http://localhost:8000/api/
Production: https://api.evivi.com/api/
```

## Authentification

Tous les endpoints (sauf auth) nécessitent un token JWT dans le header :

```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentification

### Inscription

```http
POST /auth/register/
```

**Request Body:**
```json
{
  "username": "chef_moussa",
  "email": "moussa@example.com",
  "password": "securePassword123",
  "password_confirm": "securePassword123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "username": "chef_moussa",
    "email": "moussa@example.com",
    ...
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Connexion

```http
POST /auth/login/
```

**Request Body:**
```json
{
  "username": "chef_moussa",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Profil Utilisateur

```http
GET /auth/me/
PATCH /auth/me/
```

**Response (GET):**
```json
{
  "id": 1,
  "username": "chef_moussa",
  "email": "moussa@example.com",
  "first_name": "Moussa",
  "last_name": "",
  "bio": "Chef passionné de cuisine ouest-africaine",
  "avatar": "https://.../avatar.jpg",
  "country": "Côte d'Ivoire",
  "professional_status": ["Chef", "Foodie"],
  "stats": {
    "followers": 1200,
    "following": 50,
    "recipes": 12
  },
  "created_at": "2026-02-01T10:00:00Z",
  "updated_at": "2026-02-01T12:00:00Z"
}
```

**Request Body (PATCH):**
```json
{
  "bio": "Nouvelle bio",
  "country": "Sénégal",
  "professional_status": ["Chef", "Blogger"]
}
```

**Multipart (PATCH avec avatar):**
```
Content-Type: multipart/form-data

bio: "Nouvelle bio"
avatar: [fichier]
```

---

## 👤 Utilisateurs

### Profil d'un utilisateur

```http
GET /users/{username}/
```

**Response:**
```json
{
  "id": 5,
  "username": "fatou_cooks",
  "avatar": "https://.../avatar.jpg",
  "bio": "...",
  "country": "Sénégal",
  "professional_status": ["Chef"],
  "stats": {
    "followers": 1200,
    "following": 50,
    "recipes": 12
  },
  "is_following": false
}
```

### Suivre / Ne plus suivre

```http
POST /users/{id}/follow/
```

**Response:**
```json
{
  "following": true,
  "message": "Vous suivez maintenant cet utilisateur"
}
```

### Recommandations

```http
GET /users/recommendations/all/
```

**Response:**
```json
[
  {
    "id": 10,
    "username": "chef_amadou",
    "avatar": "https://...",
    "bio": "...",
    "stats": {
      "followers": 5000,
      "following": 100,
      "recipes": 45
    }
  }
]
```

### Recettes d'un utilisateur

```http
GET /users/{username}/recipes/
```

**Response:** Liste de recettes (voir section Recettes)

### Followers / Following

```http
GET /users/{username}/followers/
GET /users/{username}/following/
```

---

## 🍳 Recettes

### Liste des recettes

```http
GET /recipes/
```

**Query Parameters:**
- `page` - Numéro de page
- `page_size` - Taille de page (max 100)
- `categories` - Filtrer par catégorie ID
- `difficulty` - easy, medium, hard
- `search` - Recherche textuelle
- `ordering` - created_at, -created_at, likes_count

**Response:**
```json
{
  "count": 150,
  "next": "https://.../recipes/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Jollof Rice",
      "description": "...",
      "author": {
        "id": 5,
        "username": "fatou_cooks",
        "avatar": "https://..."
      },
      "categories": [...],
      "images": [...],
      "ingredients": [...],
      "steps": [...],
      "cooking_time": "45 mins",
      "servings": "4",
      "difficulty": "medium",
      "likes_count": 150,
      "saves_count": 45,
      "comments_count": 23,
      "is_liked": true,
      "is_saved": false,
      "created_at": "2026-02-01T10:00:00Z"
    }
  ]
}
```

### Créer une recette

```http
POST /recipes/
Content-Type: multipart/form-data
```

**Request Body:**
```
title: "Jollof Rice"
description: "Une délicieuse recette de riz..."
cooking_time: "45 mins"
servings: "4"
difficulty: "medium"
ingredients: [{"name": "Riz", "amount": "500g", "unit": "g"}, ...]
steps: ["Laver le riz", "Cuire la tomate..."]
category_ids: [1, 2]
images: [fichier1, fichier2, ...]
```

### Détail d'une recette

```http
GET /recipes/{id}/
```

### Modifier une recette

```http
PUT /recipes/{id}/
PATCH /recipes/{id}/
```

### Supprimer une recette

```http
DELETE /recipes/{id}/
```

### Liker une recette

```http
POST /recipes/{id}/like/
```

**Response:**
```json
{
  "likes_count": 151,
  "is_liked": true,
  "message": "Recette aimée"
}
```

### Enregistrer une recette

```http
POST /recipes/{id}/save/
```

**Response:**
```json
{
  "is_saved": true,
  "message": "Recette enregistrée"
}
```

### Commentaires

```http
GET /recipes/{id}/comments/
POST /recipes/{id}/comments/
```

**Request Body (POST):**
```json
{
  "content": "Super recette ! Merci pour le partage."
}
```

**Response:**
```json
[
  {
    "id": 1,
    "user": {
      "id": 10,
      "username": "user123",
      "avatar": "https://..."
    },
    "content": "Super recette !",
    "created_at": "2026-02-01T12:00:00Z",
    "updated_at": "2026-02-01T12:00:00Z"
  }
]
```

### Supprimer un commentaire

```http
DELETE /recipes/comments/{id}/
```

### Fil d'actualité

```http
GET /recipes/feed/?scope=global|following
```

**Query Parameters:**
- `scope` - `global` (défaut) ou `following`
- `page` - Pagination

### Recherche

```http
GET /recipes/search/?q=jollof&category=Vegan
```

**Query Parameters:**
- `q` - Terme de recherche
- `category` - Filtrer par catégorie

### Tendances

```http
GET /recipes/trending/
```

### Recettes enregistrées

```http
GET /recipes/saved/
```

---

## 📱 Stories (Kitchen Moments)

### Feed de stories

```http
GET /stories/feed/
```

**Response:**
```json
{
  "story_groups": [
    {
      "user": {
        "id": 5,
        "username": "fatou_cooks",
        "avatar": "https://..."
      },
      "stories": [
        {
          "id": 1,
          "media": "https://.../story1.jpg",
          "media_type": "image",
          "caption": "En cuisine !",
          "created_at": "2026-02-01T10:00:00Z",
          "expires_at": "2026-02-02T10:00:00Z"
        }
      ],
      "has_unseen": true
    }
  ]
}
```

### Créer une story

```http
POST /stories/
Content-Type: multipart/form-data
```

**Request Body:**
```
media: [fichier image ou vidéo]
media_type: "image" | "video"
caption: "En cuisine !"
font_style: "modern"
font_color: "#FFFFFF"
text_position: {"x": 0.5, "y": 0.5}
mentioned_usernames: ["user1", "user2"]
```

### Voir une story

```http
POST /stories/{id}/view/
```

**Response:**
```json
{
  "viewed": true,
  "views_count": 45
}
```

### Réagir à une story

```http
POST /stories/{id}/react/
```

**Request Body:**
```json
{
  "reaction_type": "love"
}
```

**Types de réactions:** `like`, `love`, `fire`, `yum`, `clap`

**Response:**
```json
{
  "reaction_type": "love",
  "is_active": true,
  "message": "Réaction love ajoutée"
}
```

### Mes stories

```http
GET /stories/my_stories/
```

### Stories d'un utilisateur

```http
GET /stories/user_stories/?username=chef_moussa
```

---

## 🔔 Notifications

### Liste des notifications

```http
GET /notifications/
```

**Query Parameters:**
- `page` - Pagination
- `is_read` - Filtrer par lu/non lu

**Response:**
```json
{
  "count": 50,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": 1,
      "notification_type": "recipe_like",
      "actor": {
        "id": 10,
        "username": "user123",
        "avatar": "https://..."
      },
      "target_recipe": {
        "id": 5,
        "title": "Jollof Rice"
      },
      "message": "user123 a aimé votre recette \"Jollof Rice\"",
      "is_read": false,
      "created_at": "2026-02-01T10:00:00Z"
    }
  ]
}
```

### Notifications groupées

```http
GET /notifications/grouped/
```

**Response:**
```json
{
  "today": [...],
  "yesterday": [...],
  "this_week": [...],
  "earlier": [...],
  "unread_count": 5
}
```

### Marquer comme lues

```http
POST /notifications/mark_read/
```

**Request Body:**
```json
{
  "notification_ids": [1, 2, 3]
}
```

Ou marquer toutes :
```json
{
  "mark_all": true
}
```

### Nombre de notifications non lues

```http
GET /notifications/unread_count/
```

**Response:**
```json
{
  "unread_count": 5
}
```

### Archiver une notification

```http
POST /notifications/{id}/archive/
```

### Préférences de notification

```http
GET /notifications/preferences/
PUT /notifications/preferences/
```

**Response/Request:**
```json
{
  "email_follow": true,
  "email_recipe_like": true,
  "email_recipe_comment": true,
  "email_story_reaction": false,
  "email_mention": true,
  "push_follow": true,
  "push_recipe_like": true,
  "push_recipe_comment": true,
  "push_story_reaction": true,
  "push_mention": true,
  "digest_frequency": "instant"
}
```

---

## 📊 Codes de statut HTTP

| Code | Description |
|------|-------------|
| 200 | OK - Requête réussie |
| 201 | Created - Ressource créée |
| 204 | No Content - Suppression réussie |
| 400 | Bad Request - Données invalides |
| 401 | Unauthorized - Non authentifié |
| 403 | Forbidden - Permission refusée |
| 404 | Not Found - Ressource non trouvée |
| 500 | Internal Server Error - Erreur serveur |

---

## 🔄 Pagination

Tous les endpoints de liste supportent la pagination :

```
GET /recipes/?page=2&page_size=20
```

**Response:**
```json
{
  "count": 150,
  "next": "https://.../recipes/?page=3",
  "previous": "https://.../recipes/?page=1",
  "results": [...]
}
```

---

## ❌ Gestion des erreurs

**Format d'erreur standard:**
```json
{
  "detail": "Message d'erreur général"
}
```

**Erreurs de validation:**
```json
{
  "field_name": ["Message d'erreur spécifique"]
}
```

**Exemple:**
```json
{
  "username": ["Ce nom d'utilisateur existe déjà."],
  "email": ["Cet email est déjà utilisé."]
}
```

---

## 📱 Types de notifications

| Type | Description | Cible |
|------|-------------|-------|
| `follow` | Nouveau follower | - |
| `recipe_like` | Like sur une recette | Recette |
| `recipe_comment` | Commentaire sur une recette | Recette |
| `story_view` | Vue sur une story | Story |
| `story_reaction` | Réaction à une story | Story |
| `mention` | Mention dans un contenu | - |

---

## 🎨 Catégories de recettes

Catégories prédéfinies (extensibles via admin):

- `West African` - Cuisine ouest-africaine
- `Vegan` - Végétalien
- `Vegetarian` - Végétarien
- `Spicy` - Épicé
- `Dessert` - Desserts
- `Quick & Easy` - Rapide et facile
- `Healthy` - Sain
- `Traditional` - Traditionnel
