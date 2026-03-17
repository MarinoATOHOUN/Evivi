"""
Serializers for Recipes app
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Category, Recipe, RecipeTitle, RecipeDescription, RecipeImage,
    Ingredient, PreparationStep, RecipeLike, SavedRecipe,
    Comment, CommentContent, RecipeView
)
from users.serializers import UserMinimalSerializer

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    """Serializer pour les catégories"""
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'color']


class IngredientSerializer(serializers.ModelSerializer):
    """Serializer pour les ingrédients"""
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'amount', 'unit', 'order', 'is_active']


class IngredientCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'ingrédients"""
    class Meta:
        model = Ingredient
        fields = ['name', 'amount', 'unit', 'order']


class PreparationStepSerializer(serializers.ModelSerializer):
    """Serializer pour les étapes de préparation"""
    class Meta:
        model = PreparationStep
        fields = ['id', 'text', 'order', 'is_active']


class PreparationStepCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'étapes"""
    class Meta:
        model = PreparationStep
        fields = ['text', 'order']


class RecipeImageSerializer(serializers.ModelSerializer):
    """Serializer pour les images de recette"""
    class Meta:
        model = RecipeImage
        fields = ['id', 'image', 'order', 'is_active']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer pour les commentaires"""
    user = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    id = serializers.UUIDField(source='uuid', read_only=True)


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de commentaires"""
    class Meta:
        model = Comment
        fields = ['content']


class RecipeMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour les références de recette"""
    author = UserMinimalSerializer(read_only=True)
    first_image = serializers.SerializerMethodField()
    

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'author', 'first_image', 'cooking_time', 'servings']
        
    id = serializers.UUIDField(source='uuid', read_only=True)
    
    def get_first_image(self, obj):
        first_img = obj.images_recipe.filter(is_active=True).first()
        if first_img:
            return RecipeImageSerializer(first_img).data
        return None


class RecipeSerializer(serializers.ModelSerializer):
    """Serializer complet pour les recettes"""
    author = UserMinimalSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    images = RecipeImageSerializer(source='images_recipe', many=True, read_only=True)
    ingredients = IngredientSerializer(source='ingredients_recipe', many=True, read_only=True)
    steps = PreparationStepSerializer(source='steps_recipe', many=True, read_only=True)
    
    # Statistiques et interactions
    likes_count = serializers.IntegerField(read_only=True)
    saves_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'author',
            'categories', 'images', 'ingredients', 'steps',
            'cooking_time', 'servings', 'difficulty',
            'likes_count', 'saves_count', 'comments_count',
            'is_liked', 'is_saved',
            'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    id = serializers.UUIDField(source='uuid', read_only=True)
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return RecipeLike.objects.filter(
                recipe=obj,
                user=request.user,
                is_active=True
            ).exists()
        return False
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedRecipe.objects.filter(
                recipe=obj,
                user=request.user,
                is_active=True
            ).exists()
        return False


class RecipeCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de recettes"""
    ingredients = IngredientCreateSerializer(many=True, required=False)
    steps = PreparationStepCreateSerializer(many=True, required=False)
    category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'cooking_time', 'servings',
            'difficulty', 'ingredients', 'steps', 'category_ids', 'images'
        ]
        
    id = serializers.UUIDField(source='uuid', read_only=True)

    def to_internal_value(self, data):
        """
        In multipart/form-data, nested lists/dicts often arrive as JSON strings
        and `request.data` is commonly a QueryDict/MultiValueDict.

        We normalize to a plain dict first (preserving multi-value keys like
        `images`), then JSON-decode specific fields.
        """
        import json

        # Normalize incoming data to a plain dict while preserving multi-value keys
        normalized = data
        if hasattr(data, 'getlist') and hasattr(data, 'keys'):
            normalized = {}
            for key in data.keys():
                values = data.getlist(key)
                if key == 'images':
                    normalized[key] = values
                else:
                    normalized[key] = values if len(values) > 1 else values[0]
        elif not isinstance(data, dict):
            try:
                normalized = dict(data)
            except Exception:
                normalized = data

        # JSON-decode nested fields when they are provided as strings
        for key in ('ingredients', 'steps', 'category_ids'):
            if key in normalized and isinstance(normalized[key], str):
                try:
                    normalized[key] = json.loads(normalized[key])
                except json.JSONDecodeError:
                    pass

        return super().to_internal_value(normalized)

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients', [])
        steps_data = validated_data.pop('steps', [])
        category_ids = validated_data.pop('category_ids', [])
        images_data = validated_data.pop('images', [])
        
        # Créer la recette
        recipe = Recipe.objects.create(**validated_data)
        
        # Ajouter les catégories
        if category_ids:
            categories = Category.objects.filter(id__in=category_ids, is_active=True)
            recipe.categories.set(categories)
        
        # Créer les ingrédients
        for i, ingredient_data in enumerate(ingredients_data):
            order = ingredient_data.pop('order', i)
            Ingredient.objects.create(recipe=recipe, order=order, **ingredient_data)
        
        # Créer les étapes
        for i, step_data in enumerate(steps_data):
            if isinstance(step_data, str):
                text = step_data
                order = i
            else:
                text = step_data.get('text', '')
                order = step_data.get('order', i)
            PreparationStep.objects.create(recipe=recipe, text=text, order=order)
            
        # Gérer les images multiples
        for i, image in enumerate(images_data):
            RecipeImage.objects.create(recipe=recipe, image=image, order=i)
        
        return recipe
    
    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)
        steps_data = validated_data.pop('steps', None)
        category_ids = validated_data.pop('category_ids', None)
        images_data = validated_data.pop('images', None)
        
        # Mettre à jour les champs de base
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Mettre à jour les catégories
        if category_ids is not None:
            categories = Category.objects.filter(id__in=category_ids, is_active=True)
            instance.categories.set(categories)
        
        # Mettre à jour les ingrédients
        if ingredients_data is not None:
            instance.ingredients_recipe.filter(is_active=True).update(is_active=False)
            for i, ingredient_data in enumerate(ingredients_data):
                order = ingredient_data.pop('order', i)
                Ingredient.objects.create(recipe=instance, order=order, **ingredient_data)
        
        # Mettre à jour les étapes
        if steps_data is not None:
            instance.steps_recipe.filter(is_active=True).update(is_active=False)
            for i, step_data in enumerate(steps_data):
                if isinstance(step_data, str):
                    text = step_data
                    order = i
                else:
                    text = step_data.get('text', '')
                    order = step_data.get('order', i)
                PreparationStep.objects.create(recipe=instance, text=text, order=order)
        
        # Gérer les images
        if images_data is not None:
            # Désactiver les anciennes images
            instance.images_recipe.filter(is_active=True).update(is_active=False)
            for i, image in enumerate(images_data):
                RecipeImage.objects.create(recipe=instance, image=image, order=i)
        
        return instance


class RecipeLikeSerializer(serializers.ModelSerializer):
    """Serializer pour les likes de recettes"""
    user = UserMinimalSerializer(read_only=True)
    recipe = RecipeMinimalSerializer(read_only=True)
    
    class Meta:
        model = RecipeLike
        fields = ['id', 'user', 'recipe', 'is_active', 'created_at']


class RecipeLikeToggleSerializer(serializers.Serializer):
    """Serializer pour la réponse de basculement de like"""
    likes_count = serializers.IntegerField()
    is_liked = serializers.BooleanField()
    message = serializers.CharField()


class SavedRecipeSerializer(serializers.ModelSerializer):
    """Serializer pour les recettes enregistrées"""
    recipe = RecipeMinimalSerializer(read_only=True)
    
    class Meta:
        model = SavedRecipe
        fields = ['id', 'recipe', 'is_active', 'created_at']


class SavedRecipeToggleSerializer(serializers.Serializer):
    """Serializer pour la réponse de basculement d'enregistrement"""
    is_saved = serializers.BooleanField()
    message = serializers.CharField()


class RecipeViewSerializer(serializers.ModelSerializer):
    """Serializer pour les vues de recettes"""
    user = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = RecipeView
        fields = ['id', 'user', 'ip_address', 'created_at']


# Serializers pour l'historique (anti-suppression)

class RecipeTitleSerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des titres"""
    class Meta:
        model = RecipeTitle
        fields = ['id', 'title', 'is_current', 'created_at']


class RecipeDescriptionSerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des descriptions"""
    class Meta:
        model = RecipeDescription
        fields = ['id', 'description', 'is_current', 'created_at']


class CommentContentSerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des contenus de commentaires"""
    class Meta:
        model = CommentContent
        fields = ['id', 'content', 'is_current', 'created_at']


class FeedSerializer(serializers.Serializer):
    """Serializer pour le feed"""
    recipes = RecipeSerializer(many=True)
    next_page = serializers.IntegerField(required=False)
    total_pages = serializers.IntegerField()
    count = serializers.IntegerField()
