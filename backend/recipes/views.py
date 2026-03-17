"""
Views for Recipes app
"""
from rest_framework import generics, status, views, viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Prefetch
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Category, Recipe, RecipeImage, Ingredient, PreparationStep,
    RecipeLike, SavedRecipe, Comment, CommentContent, RecipeView
)
from .serializers import (
    CategorySerializer, RecipeSerializer, RecipeCreateSerializer,
    RecipeMinimalSerializer, RecipeLikeToggleSerializer,
    SavedRecipeToggleSerializer, CommentSerializer, CommentCreateSerializer,
    FeedSerializer
)
from users.serializers import UserMinimalSerializer

User = get_user_model()


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les catégories de recettes
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class RecipeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les recettes
    """
    queryset = Recipe.objects.filter(is_deleted=False, is_published=True)
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categories', 'difficulty']
    search_fields = ['title', 'description', 'ingredients_recipe__name']
    ordering_fields = ['created_at', 'likes_count']
    ordering = ['-created_at']
    lookup_field = 'uuid'
    
    def get_queryset(self):
        queryset = Recipe.objects.filter(is_deleted=False, is_published=True)
        
        # Optimiser les requêtes
        queryset = queryset.select_related('author').prefetch_related(
            'categories',
            'images_recipe',
            'ingredients_recipe',
            'steps_recipe'
        ).annotate(
            likes_count=Count('recipe_likes', filter=Q(recipe_likes__is_active=True)),
            saves_count=Count('recipe_saves', filter=Q(recipe_saves__is_active=True)),
            comments_count=Count('comments_recipe', filter=Q(comments_recipe__is_deleted=False))
        )
        
        return queryset
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return RecipeCreateSerializer
        return RecipeSerializer
    
    def perform_create(self, serializer):
        recipe = serializer.save(author=self.request.user)
        
        # Créer les titres et descriptions historiques
        from .models import RecipeTitle, RecipeDescription
        RecipeTitle.objects.create(recipe=recipe, title=recipe.title)
        if recipe.description:
            RecipeDescription.objects.create(recipe=recipe, description=recipe.description)
    
    def perform_update(self, serializer):
        recipe = serializer.save()
        
        # Créer de nouveaux titres/descriptions historiques si changés
        from .models import RecipeTitle, RecipeDescription
        RecipeTitle.objects.create(recipe=recipe, title=recipe.title)
        if recipe.description:
            RecipeDescription.objects.create(recipe=recipe, description=recipe.description)
    
    def destroy(self, request, *args, **kwargs):
        """Suppression logique (soft delete)"""
        recipe = self.get_object()
        
        if recipe.author != request.user:
            raise PermissionDenied("Vous ne pouvez pas supprimer cette recette")
        
        recipe.soft_delete(user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def like(self, request, **kwargs):
        """
        POST /api/recipes/{id}/like/
        Liker ou unliker une recette
        """
        recipe = self.get_object()
        
        like, created = RecipeLike.objects.get_or_create(
            recipe=recipe,
            user=request.user,
            defaults={'is_active': True}
        )
        
        if not created:
            like.is_active = not like.is_active
            if not like.is_active:
                like.unliked_at = timezone.now()
            like.save()
        
        # Créer une notification si like
        if like.is_active and recipe.author != request.user:
            from notifications.utils import create_notification
            create_notification(
                recipient=recipe.author,
                actor=request.user,
                notification_type='recipe_like',
                target=recipe
            )
        
        likes_count = RecipeLike.objects.filter(recipe=recipe, is_active=True).count()
        message = "Recette aimée" if like.is_active else "Like retiré"
        
        return Response({
            'likes_count': likes_count,
            'is_liked': like.is_active,
            'message': message
        })
    
    @action(detail=True, methods=['post'])
    def save(self, request, **kwargs):
        """
        POST /api/recipes/{id}/save/
        Enregistrer ou retirer une recette des favoris
        """
        recipe = self.get_object()
        
        saved, created = SavedRecipe.objects.get_or_create(
            recipe=recipe,
            user=request.user,
            defaults={'is_active': True}
        )
        
        if not created:
            saved.is_active = not saved.is_active
            if not saved.is_active:
                saved.unsaved_at = timezone.now()
            saved.save()
        
        message = "Recette enregistrée" if saved.is_active else "Recette retirée des favoris"
        
        return Response({
            'is_saved': saved.is_active,
            'message': message
        })
    
    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, **kwargs):
        """
        GET /api/recipes/{id}/comments/
        POST /api/recipes/{id}/comments/
        Lister ou ajouter des commentaires
        """
        recipe = self.get_object()
        
        if request.method == 'GET':
            comments = Comment.objects.filter(
                recipe=recipe,
                is_deleted=False
            ).select_related('user').order_by('-created_at')
            
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = CommentCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            comment = Comment.objects.create(
                recipe=recipe,
                user=request.user,
                content=serializer.validated_data['content']
            )
            
            # Créer l'historique du contenu
            CommentContent.objects.create(comment=comment, content=comment.content)
            
            # Créer une notification
            if recipe.author != request.user:
                from notifications.utils import create_notification
                create_notification(
                    recipient=recipe.author,
                    actor=request.user,
                    notification_type='recipe_comment',
                    target=recipe,
                    extra_data={'comment_text': comment.content[:100]}
                )
            
            return Response(
                CommentSerializer(comment).data,
                status=status.HTTP_201_CREATED
            )
    
    @action(detail=False, methods=['get'])
    def feed(self, request):
        """
        GET /api/recipes/feed/
        Fil d'actualité des recettes
        """
        scope = request.query_params.get('scope', 'global')
        
        if scope == 'following':
            # Récupérer les recettes des utilisateurs suivis
            following_ids = request.user.following.filter(
                is_active=True,
                is_deleted=False
            ).values_list('uuid', flat=True)
            
            recipes = Recipe.objects.filter(
                author__uuid__in=following_ids,
                is_deleted=False,
                is_published=True
            )
        else:
            # Toutes les recettes publiques
            recipes = Recipe.objects.filter(
                is_deleted=False,
                is_published=True
            )
        
        # Optimiser et annoter
        recipes = recipes.select_related('author').prefetch_related(
            'categories',
            'images_recipe'
        ).annotate(
            likes_count=Count('recipe_likes', filter=Q(recipe_likes__is_active=True)),
            saves_count=Count('recipe_saves', filter=Q(recipe_saves__is_active=True)),
            comments_count=Count('comments_recipe', filter=Q(comments_recipe__is_deleted=False))
        ).order_by('-created_at')
        
        # Paginer
        page = self.paginate_queryset(recipes)
        if page is not None:
            serializer = RecipeSerializer(
                page,
                many=True,
                context={'request': request}
            )
            return self.get_paginated_response(serializer.data)
        
        serializer = RecipeSerializer(
            recipes,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        GET /api/recipes/search/?q=term&category=vegan
        Recherche de recettes
        """
        query = request.query_params.get('q', '')
        category = request.query_params.get('category', '')
        
        recipes = Recipe.objects.filter(
            is_deleted=False,
            is_published=True
        )
        
        if query:
            recipes = recipes.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(ingredients_recipe__name__icontains=query)
            )
        
        if category:
            recipes = recipes.filter(categories__name__iexact=category)
        
        recipes = recipes.select_related('author').prefetch_related(
            'categories',
            'images_recipe'
        ).annotate(
            likes_count=Count('recipe_likes', filter=Q(recipe_likes__is_active=True)),
            saves_count=Count('recipe_saves', filter=Q(recipe_saves__is_active=True)),
            comments_count=Count('comments_recipe', filter=Q(comments_recipe__is_deleted=False))
        ).distinct().order_by('-created_at')
        
        page = self.paginate_queryset(recipes)
        if page is not None:
            serializer = RecipeSerializer(
                page,
                many=True,
                context={'request': request}
            )
            return self.get_paginated_response(serializer.data)
        
        serializer = RecipeSerializer(
            recipes,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """
        GET /api/recipes/trending/
        Recettes populaires (tendances)
        """
        recipes = Recipe.objects.filter(
            is_deleted=False,
            is_published=True
        ).annotate(
            likes_count=Count('recipe_likes', filter=Q(recipe_likes__is_active=True)),
            saves_count=Count('recipe_saves', filter=Q(recipe_saves__is_active=True)),
            comments_count=Count('comments_recipe', filter=Q(comments_recipe__is_deleted=False)),
            views_count=Count('views_recipe')
        ).order_by('-likes_count', '-views_count')[:20]
        
        serializer = RecipeSerializer(
            recipes,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def saved(self, request):
        """
        GET /api/recipes/saved/
        Recettes enregistrées par l'utilisateur
        """
        saved_recipes = Recipe.objects.filter(
            recipe_saves__user=request.user,
            recipe_saves__is_active=True,
            is_deleted=False,
            is_published=True
        ).select_related('author').prefetch_related(
            'categories',
            'images_recipe'
        ).annotate(
            likes_count=Count('recipe_likes', filter=Q(recipe_likes__is_active=True)),
            saves_count=Count('recipe_saves', filter=Q(recipe_saves__is_active=True)),
            comments_count=Count('comments_recipe', filter=Q(comments_recipe__is_deleted=False))
        ).order_by('-recipe_saves__created_at')
        
        page = self.paginate_queryset(saved_recipes)
        if page is not None:
            serializer = RecipeSerializer(
                page,
                many=True,
                context={'request': request}
            )
            return self.get_paginated_response(serializer.data)
        
        serializer = RecipeSerializer(
            saved_recipes,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)


class CommentDeleteView(views.APIView):
    """
    DELETE /api/recipes/comments/{id}/
    Supprimer un commentaire (soft delete)
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, comment_id):
        try:
            comment = Comment.objects.get(uuid=comment_id)
        except Comment.DoesNotExist:
            raise NotFound("Commentaire non trouvé")
        
        if comment.user != request.user and comment.recipe.author != request.user:
            raise PermissionDenied("Vous ne pouvez pas supprimer ce commentaire")
        
        comment.soft_delete(user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
