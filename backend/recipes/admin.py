"""
Admin configuration for Recipes app
"""
from django.contrib import admin
from .models import (
    Category, Recipe, RecipeImage, Ingredient, 
    PreparationStep, RecipeLike, SavedRecipe, Comment
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']


class RecipeImageInline(admin.TabularInline):
    model = RecipeImage
    extra = 1


class IngredientInline(admin.TabularInline):
    model = Ingredient
    extra = 1


class PreparationStepInline(admin.TabularInline):
    model = PreparationStep
    extra = 1


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'cooking_time', 'servings', 'is_published', 'created_at']
    list_filter = ['is_published', 'is_deleted', 'difficulty', 'categories']
    search_fields = ['title', 'description', 'author__username']
    inlines = [RecipeImageInline, IngredientInline, PreparationStepInline]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'user', 'is_deleted', 'created_at']
    list_filter = ['is_deleted']
    search_fields = ['content', 'recipe__title', 'user__username']


@admin.register(RecipeLike)
class RecipeLikeAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'user', 'is_active', 'created_at']
    list_filter = ['is_active']


@admin.register(SavedRecipe)
class SavedRecipeAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'user', 'is_active', 'created_at']
    list_filter = ['is_active']
