# Evivi API

API REST Django pour l'application Evivi - Réseau social culinaire mobile-first.

## 🚀 Caractéristiques

- **Authentification JWT** - Connexion sécurisée avec tokens
- **Architecture anti-suppression** - Toutes les données conservent leur historique
- **Feed social** - Fil d'actualité avec recettes et stories
- **Gestion des recettes** - CRUD complet avec ingrédients et étapes
- **Kitchen Moments (Stories)** - Contenu éphémère 24h
- **Système de notifications** - En temps réel avec historique
- **Recherche avancée** - Filtres par catégories, ingrédients
- **Documentation API** - Swagger/OpenAPI auto-générée

## 📁 Structure du projet

```
evivi_api/
├── core/                   # Configuration Django
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── users/                  # Authentification & Profils
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── admin.py
├── recipes/                # Recettes, Ingrédients, Commentaires
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── admin.py
├── stories/                # Kitchen Moments (Stories)
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── admin.py
├── notifications/          # Système de notifications
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── utils.py
├── manage.py
├── requirements.txt
└── .env.example
```

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd evivi_api
```

### 2. Créer un environnement virtuel

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 4. Configurer les variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

### 5. Créer la base de données (PostgreSQL)

```bash
# Créer la base de données et l'utilisateur
psql -U postgres
CREATE DATABASE evivi_db;
CREATE USER evivi_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE evivi_db TO evivi_user;
\q
```

### 6. Appliquer les migrations

```bash
python manage.py migrate
```

### 7. Créer un superutilisateur

```bash
python manage.py createsuperuser
```

### 8. Lancer le serveur

```bash
python manage.py runserver
```

## 📚 Documentation API

Une fois le serveur lancé, accédez à la documentation :

- **Swagger UI** : http://localhost:8000/api/docs/
- **ReDoc** : http://localhost:8000/api/redoc/
- **Schema OpenAPI** : http://localhost:8000/api/schema/

## 🔌 Endpoints API Principaux

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register/` | Inscription |
| POST | `/api/auth/login/` | Connexion (JWT) |
| POST | `/api/auth/refresh/` | Rafraîchir le token |
| POST | `/api/auth/logout/` | Déconnexion |
| GET | `/api/auth/me/` | Profil utilisateur |
| PATCH | `/api/auth/me/` | Modifier profil |

### Utilisateurs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/users/{username}/` | Profil utilisateur |
| POST | `/api/users/{id}/follow/` | Suivre/Ne plus suivre |
| GET | `/api/users/recommendations/all/` | Recommandations |
| GET | `/api/users/{username}/recipes/` | Recettes de l'utilisateur |
| GET | `/api/users/{username}/followers/` | Followers |
| GET | `/api/users/{username}/following/` | Following |

### Recettes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/recipes/` | Liste des recettes |
| POST | `/api/recipes/` | Créer une recette |
| GET | `/api/recipes/{id}/` | Détail recette |
| PUT | `/api/recipes/{id}/` | Modifier recette |
| DELETE | `/api/recipes/{id}/` | Supprimer recette |
| GET | `/api/recipes/feed/` | Fil d'actualité |
| GET | `/api/recipes/search/` | Recherche |
| GET | `/api/recipes/trending/` | Tendances |
| POST | `/api/recipes/{id}/like/` | Liker/Unlike |
| POST | `/api/recipes/{id}/save/` | Enregistrer |
| GET | `/api/recipes/{id}/comments/` | Commentaires |
| POST | `/api/recipes/{id}/comments/` | Ajouter commentaire |

### Stories (Kitchen Moments)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/stories/feed/` | Feed de stories |
| POST | `/api/stories/` | Créer une story |
| POST | `/api/stories/{id}/view/` | Voir une story |
| POST | `/api/stories/{id}/react/` | Réagir à une story |
| GET | `/api/stories/my_stories/` | Mes stories |

### Notifications

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notifications/` | Liste notifications |
| GET | `/api/notifications/grouped/` | Groupées par période |
| POST | `/api/notifications/mark_read/` | Marquer comme lues |
| GET | `/api/notifications/unread_count/` | Nombre non lues |
| GET | `/api/notifications/preferences/` | Préférences |
| PUT | `/api/notifications/preferences/` | Modifier préférences |

## 🗄️ Architecture Anti-Suppression

Le projet implémente une architecture qui préserve l'historique des données :

- **Soft Delete** : Les données ne sont jamais supprimées, juste marquées comme `is_deleted=True`
- **Historique des modifications** : Chaque changement crée une nouvelle entrée historique
- **Relations conservées** : Les relations (likes, follows) sont désactivées, pas supprimées
- **Logs d'activité** : Toutes les actions utilisateur sont journalisées

### Exemple de modèles avec historique :

```python
# User conserve son historique de bio
UserBio.objects.filter(user=user, is_current=True)  # Bio actuelle
UserBio.objects.filter(user=user)  # Toutes les bios

# Les likes ne sont pas supprimés
RecipeLike.objects.filter(recipe=recipe, is_active=True)  # Likes actifs
RecipeLike.objects.filter(recipe=recipe)  # Tout l'historique des likes
```

## 🔒 Sécurité

- **JWT Authentication** : Tokens avec refresh
- **CORS** : Configuré pour le frontend React
- **Permissions** : Par objet (propriétaire uniquement pour modifications)
- **Validation** : Données validées côté serveur

## 🧪 Tests

```bash
# Exécuter les tests
python manage.py test

# Avec coverage
pytest --cov=.
```

## 🚀 Déploiement

### Production

1. Définir `DEBUG=False` dans `.env`
2. Configurer une base de données PostgreSQL
3. Configurer un serveur de fichiers statiques (S3, CloudFront)
4. Utiliser Gunicorn ou uWSGI
5. Configurer Nginx comme reverse proxy

```bash
# Exemple avec Gunicorn
gunicorn core.wsgi:application -b 0.0.0.0:8000
```

## 📄 Licence

Propriétaire - Hypee

## 👥 Auteurs

- **Hypee** - Développement

---

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue.
