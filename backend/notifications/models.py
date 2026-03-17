"""
Models for Notifications app
Architecture anti-suppression - Toutes les notifications conservent une trace historique
"""
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


class Notification(models.Model):
    """
    Notification système - jamais supprimée, juste marquée comme lue/archivée
    """
    NOTIFICATION_TYPES = [
        ('follow', 'New Follower'),
        ('recipe_like', 'Recipe Like'),
        ('recipe_comment', 'Recipe Comment'),
        ('story_view', 'Story View'),
        ('story_reaction', 'Story Reaction'),
        ('mention', 'Mention'),
        ('system', 'System'),
    ]
    
    # Destinataire de la notification
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications_received'
    )
    
    # Utilisateur qui a déclenché l'action
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications_sent'
    )
    
    # Type de notification
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES
    )
    
    # Message personnalisé
    message = models.TextField(null=True, blank=True)
    
    # Cible générique (peut être une recette, un commentaire, etc.)
    target_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    target_object_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey('target_content_type', 'target_object_id')
    
    # Pour le regroupement (ex: "X et 5 autres ont aimé...")
    group_key = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    
    # Données riches (preview image, snippets, etc.)
    extra_data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Archivage (anti-suppression)
    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['recipient', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.actor.username} {self.notification_type} -> {self.recipient.username}"
    
    def mark_as_read(self):
        """Marquer la notification comme lue"""
        from django.utils import timezone
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
    
    def archive(self):
        """Archiver la notification (au lieu de la supprimer)"""
        from django.utils import timezone
        self.is_archived = True
        self.archived_at = timezone.now()
        self.save()


class NotificationPreference(models.Model):
    """
    Préférences de notification par utilisateur
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    
    # Préférences par type
    email_follow = models.BooleanField(default=True)
    email_recipe_like = models.BooleanField(default=True)
    email_recipe_comment = models.BooleanField(default=True)
    email_story_reaction = models.BooleanField(default=False)
    email_mention = models.BooleanField(default=True)
    
    push_follow = models.BooleanField(default=True)
    push_recipe_like = models.BooleanField(default=True)
    push_recipe_comment = models.BooleanField(default=True)
    push_story_reaction = models.BooleanField(default=True)
    push_mention = models.BooleanField(default=True)
    
    # Paramètres généraux
    digest_frequency = models.CharField(
        max_length=20,
        choices=[
            ('instant', 'Instant'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('never', 'Never'),
        ],
        default='instant'
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
    
    def __str__(self):
        return f"Préférences de {self.user.username}"


class NotificationHistory(models.Model):
    """
    Historique détaillé des notifications envoyées
    """
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='history_notification'
    )
    action = models.CharField(max_length=50)  # created, sent, read, archived
    channel = models.CharField(max_length=20, null=True, blank=True)  # push, email, in_app
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification_history'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Historique: {self.notification.id} - {self.action}"


class NotificationBatch(models.Model):
    """
    Batch de notifications pour envoi groupé (digest)
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_batches'
    )
    notifications = models.ManyToManyField(
        Notification,
        related_name='batches'
    )
    batch_type = models.CharField(
        max_length=20,
        choices=[
            ('daily', 'Daily Digest'),
            ('weekly', 'Weekly Digest'),
        ]
    )
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification_batches'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Batch {self.batch_type} pour {self.user.username}"
