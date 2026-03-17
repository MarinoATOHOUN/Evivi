"""
Models for Recipes app - Architecture anti-suppression
Toutes les données conservent une trace historique
"""
from django.db import models
from django.conf import settings
import uuid


class Category(models.Model):
    """
    Catégories de recettes (West African, Vegan, Spicy...)
    """
    name = models.CharField(max_length=100, unique=True, null=False, blank=False)
    description = models.TextField(null=True, blank=True)
    icon = models.CharField(max_length=50, null=True, blank=True)
    color = models.CharField(max_length=7, default="#000000")  # Hex color
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        ordering = ['name']
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name


class Recipe(models.Model):
    """
    Recette principale - jamais vraiment supprimée
    """
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recipes_user'
    )
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    title = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(null=True, blank=True)
    cooking_time = models.CharField(max_length=50, null=True, blank=True)
    servings = models.CharField(max_length=50, null=True, blank=True)
    difficulty = models.CharField(
        max_length=20,
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
        ],
        default='medium'
    )
    
    # Relations
    categories = models.ManyToManyField(
        Category,
        related_name='recipes_category',
        blank=True
    )
    
    # Interactions
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='RecipeLike',
        related_name='liked_recipes',
        blank=True
    )
    saved_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='SavedRecipe',
        related_name='saved_recipes',
        blank=True
    )
    
    # Gestion de l'état (anti-suppression)
    is_published = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_recipes'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'recipes'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def get_likes_count(self):
        return self.recipe_likes.filter(is_active=True).count()
    
    @property
    def get_saves_count(self):
        return self.recipe_saves.filter(is_active=True).count()
    
    @property
    def get_comments_count(self):
        return self.comments_recipe.filter(is_deleted=False).count()
    
    def soft_delete(self, user=None):
        """Suppression logique de la recette"""
        from django.utils import timezone
        self.is_published = False
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save()


class RecipeTitle(models.Model):
    """
    Historique des titres de recette
    """
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='titles_recipe'
    )
    title = models.CharField(max_length=255, null=False, blank=False)
    is_current = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'recipe_titles'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.is_current:
            RecipeTitle.objects.filter(recipe=self.recipe, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class RecipeDescription(models.Model):
    """
    Historique des descriptions de recette
    """
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='descriptions_recipe'
    )
    description = models.TextField(null=False, blank=False)
    is_current = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'recipe_descriptions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Description de {self.recipe.title}"
    
    def save(self, *args, **kwargs):
        if self.is_current:
            RecipeDescription.objects.filter(recipe=self.recipe, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class RecipeImage(models.Model):
    """
    Images d'une recette avec historique
    """
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='images_recipe'
    )
    image = models.ImageField(upload_to='recipes/images/')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'recipe_images'
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return f"Image {self.order} de {self.recipe.title}"


class Ingredient(models.Model):
    """
    Ingrédient d'une recette - jamais supprimé, juste désactivé
    """
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='ingredients_recipe'
    )
    name = models.CharField(max_length=255, null=False, blank=False)
    amount = models.CharField(max_length=100, null=True, blank=True)
    unit = models.CharField(max_length=50, null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ingredients'
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.amount})"


class PreparationStep(models.Model):
    """
    Étape de préparation - jamais supprimée, juste désactivée
    """
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='steps_recipe'
    )
    text = models.TextField(null=False, blank=False)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'preparation_steps'
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return f"Étape {self.order} de {self.recipe.title}"


class RecipeLike(models.Model):
    """
    Like sur une recette - jamais supprimé, juste désactivé
    """
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='recipe_likes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_likes'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    unliked_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'recipe_likes'
        unique_together = ['recipe', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        status = "active" if self.is_active else "inactive"
        return f"{self.user.username} likes {self.recipe.title} ({status})"


class SavedRecipe(models.Model):
    """
    Recette enregistrée (bookmark) - jamais supprimée, juste désactivée
    """
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='recipe_saves'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_saves'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    unsaved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'saved_recipes'
        unique_together = ['recipe', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        status = "saved" if self.is_active else "unsaved"
        return f"{self.user.username} {status} {self.recipe.title}"


class Comment(models.Model):
    """
    Commentaire sur une recette - jamais vraiment supprimé
    """
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='comments_recipe'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments_user'
    )
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    content = models.TextField(null=False, blank=False)
    
    # Gestion de l'état (anti-suppression)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_comments'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'comments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Commentaire de {self.user.username} sur {self.recipe.title}"
    
    def soft_delete(self, user=None):
        """Suppression logique du commentaire"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save()


class CommentContent(models.Model):
    """
    Historique du contenu des commentaires (éditions)
    """
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name='contents_comment'
    )
    content = models.TextField(null=False, blank=False)
    is_current = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'comment_contents'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Contenu de commentaire {self.comment.id}"
    
    def save(self, *args, **kwargs):
        if self.is_current:
            CommentContent.objects.filter(comment=self.comment, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class RecipeView(models.Model):
    """
    Historique des vues de recettes - conserve toutes les visualisations
    """
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name='views_recipe'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='recipe_views_user'
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'recipe_views'
        ordering = ['-created_at']
    
    def __str__(self):
        user_str = self.user.username if self.user else "Anonymous"
        return f"Vue de {self.recipe.title} par {user_str}"
