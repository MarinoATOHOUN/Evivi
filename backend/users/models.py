"""
Models for Users app - Architecture anti-suppression
Toutes les données conservent une trace historique
"""
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class User(AbstractUser):
    """
    Modèle utilisateur étendu avec architecture anti-suppression.
    Les données utilisateur ne sont jamais vraiment supprimées,
    mais marquées comme inactives.
    """
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    email = models.EmailField(unique=True, null=False, blank=False)
    bio = models.TextField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    
    # Champ pour stocker les statuts professionnels (Chef, Foodie, Blogger...)
    professional_status = models.JSONField(default=list, blank=True)
    
    # Système de followers (ManyToMany vers soi-même)
    followers = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='following',
        blank=True
    )
    
    # Gestion de l'état du compte (anti-suppression)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Configuration
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username
    
    @property
    def get_followers_count(self):
        return Follow.objects.filter(following=self, is_active=True).count()
    
    @property
    def get_following_count(self):
        return Follow.objects.filter(follower=self, is_active=True).count()
    
    @property
    def get_recipes_count(self):
        return self.recipes_user.filter(is_deleted=False).count()
    
    def soft_delete(self):
        """Suppression logique du compte utilisateur"""
        from django.utils import timezone
        self.is_active = False
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()


class UserBio(models.Model):
    """
    Historique des bios utilisateur - permet de conserver
    l'historique des modifications de bio
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bios_user'
    )
    bio = models.TextField(null=False, blank=False)
    is_current = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_bios'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Bio de {self.user.username} - {self.created_at}"
    
    def save(self, *args, **kwargs):
        """Marquer les anciennes bios comme non actuelles"""
        if self.is_current:
            UserBio.objects.filter(user=self.user, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class UserAvatar(models.Model):
    """
    Historique des avatars utilisateur - conserve toutes les photos de profil
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='avatars_user'
    )
    avatar = models.ImageField(upload_to='avatars/history/')
    is_current = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_avatars'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Avatar de {self.user.username} - {self.created_at}"
    
    def save(self, *args, **kwargs):
        """Marquer les anciens avatars comme non actuels"""
        if self.is_current:
            UserAvatar.objects.filter(user=self.user, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class UserProfessionalStatus(models.Model):
    """
    Statuts professionnels de l'utilisateur avec historique
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='professional_statuses_user'
    )
    status = models.CharField(max_length=100, null=False, blank=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_professional_statuses'
        ordering = ['-created_at']
        unique_together = ['user', 'status']
    
    def __str__(self):
        return f"{self.user.username} - {self.status}"


class UserLocation(models.Model):
    """
    Localisation de l'utilisateur avec historique
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='locations_user'
    )
    country = models.CharField(max_length=100, null=False, blank=False)
    city = models.CharField(max_length=100, null=True, blank=True)
    is_current = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_locations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.country}"
    
    def save(self, *args, **kwargs):
        if self.is_current:
            UserLocation.objects.filter(user=self.user, is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class Follow(models.Model):
    """
    Relation de suivi entre utilisateurs - jamais supprimée, juste désactivée
    """
    follower = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='follows_follower'
    )
    following = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='follows_following'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    unfollowed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'follows'
        unique_together = ['follower', 'following']
        ordering = ['-created_at']
    
    def __str__(self):
        status = "active" if self.is_active else "inactive"
        return f"{self.follower.username} -> {self.following.username} ({status})"


class UserActivityLog(models.Model):
    """
    Journal d'activité de l'utilisateur - conserve toutes les actions
    """
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('profile_update', 'Profile Update'),
        ('password_change', 'Password Change'),
        ('account_deletion', 'Account Deletion'),
        ('follow', 'Follow'),
        ('unfollow', 'Unfollow'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='activity_logs_user'
    )
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_activity_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.activity_type} - {self.created_at}"
