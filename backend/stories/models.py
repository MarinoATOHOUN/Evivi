"""
Models for Stories app - Kitchen Moments
Architecture anti-suppression - Toutes les données conservent une trace historique
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import uuid


class Story(models.Model):
    """
    Story/Kitchen Moment - contenu éphémère (24h)
    Les stories expirées ne sont pas supprimées mais marquées comme expirées
    """
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('text', 'Text'),
    ]
    
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='stories_user'
    )
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    media = models.FileField(upload_to='stories/media/', null=True, blank=True)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default='image')
    caption = models.TextField(null=True, blank=True)
    
    # Styles personnalisés
    font_style = models.CharField(max_length=50, null=True, blank=True)
    font_color = models.CharField(max_length=7, default="#FFFFFF")  # Hex color
    background_color = models.CharField(max_length=7, default="#E85D1A")  # Hex color
    text_position = models.JSONField(default=dict, blank=True)  # {x: 0.5, y: 0.5}
    
    # Gestion de l'expiration
    duration_hours = models.PositiveIntegerField(default=24)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Gestion de l'état (anti-suppression)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_stories'
    )
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stories'
        ordering = ['-created_at']
        verbose_name_plural = 'Stories'
    
    def __str__(self):
        return f"Story de {self.author.username} - {self.created_at}"
    
    @property
    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    @property
    def views_count(self):
        return self.views_story.count()
    
    def save(self, *args, **kwargs):
        """Calculer la date d'expiration si non définie"""
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=self.duration_hours)
        super().save(*args, **kwargs)
    
    def soft_delete(self, user=None):
        """Suppression logique de la story"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save()


class StoryCaption(models.Model):
    """
    Historique des légendes de story
    """
    story = models.ForeignKey(
        Story,
        on_delete=models.CASCADE,
        related_name='captions_story'
    )
    caption = models.TextField(null=False, blank=False)
    is_current = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'story_captions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Légende de story {self.story.id}"
    
    def save(self, *args, **kwargs):
        if self.is_current:
            StoryCaption.objects.filter(story=self.story, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class StoryStyle(models.Model):
    """
    Styles appliqués à une story avec historique
    """
    story = models.ForeignKey(
        Story,
        on_delete=models.CASCADE,
        related_name='styles_story'
    )
    font_style = models.CharField(max_length=50, null=True, blank=True)
    font_color = models.CharField(max_length=7, default="#FFFFFF")
    background_color = models.CharField(max_length=7, default="#E85D1A")
    text_position = models.JSONField(default=dict, blank=True)
    is_current = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'story_styles'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Style de story {self.story.id}"
    
    def save(self, *args, **kwargs):
        if self.is_current:
            StoryStyle.objects.filter(story=self.story, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class StoryView(models.Model):
    """
    Vue d'une story - conserve qui a vu quelle story
    """
    story = models.ForeignKey(
        Story,
        on_delete=models.CASCADE,
        related_name='views_story'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='story_views_user'
    )
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'story_views'
        unique_together = ['story', 'user']
        ordering = ['-viewed_at']
    
    def __str__(self):
        return f"{self.user.username} a vu la story de {self.story.author.username}"


class StoryReaction(models.Model):
    """
    Réaction à une story (emoji, like rapide)
    """
    REACTION_TYPES = [
        ('like', 'Like'),
        ('love', 'Love'),
        ('fire', 'Fire'),
        ('yum', 'Yum'),
        ('clap', 'Clap'),
    ]
    
    story = models.ForeignKey(
        Story,
        on_delete=models.CASCADE,
        related_name='reactions_story'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='story_reactions_user'
    )
    reaction_type = models.CharField(max_length=20, choices=REACTION_TYPES, default='like')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'story_reactions'
        unique_together = ['story', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} a réagi {self.reaction_type} à la story de {self.story.author.username}"


class StoryMention(models.Model):
    """
    Mention d'un utilisateur dans une story
    """
    story = models.ForeignKey(
        Story,
        on_delete=models.CASCADE,
        related_name='mentions_story'
    )
    mentioned_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='story_mentions_user'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'story_mentions'
        unique_together = ['story', 'mentioned_user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.mentioned_user.username} mentionné dans story de {self.story.author.username}"
