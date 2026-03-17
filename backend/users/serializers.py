"""
Serializers for Users app
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import (
    UserBio, UserAvatar, UserProfessionalStatus, 
    UserLocation, Follow, UserActivityLog
)

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour les références utilisateur"""

    class Meta:
        model = User
        fields = ['id', 'username', 'avatar']
        
    id = serializers.UUIDField(source='uuid', read_only=True)


class UserStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques utilisateur"""
    followers = serializers.IntegerField(source='get_followers_count', read_only=True)
    following = serializers.IntegerField(source='get_following_count', read_only=True)
    recipes = serializers.IntegerField(source='get_recipes_count', read_only=True)


class UserSerializer(serializers.ModelSerializer):
    """Serializer complet pour l'utilisateur"""
    followers_count = serializers.IntegerField(source='get_followers_count', read_only=True)
    following_count = serializers.IntegerField(source='get_following_count', read_only=True)
    recipes_count = serializers.IntegerField(source='get_recipes_count', read_only=True)
    is_following = serializers.SerializerMethodField()
    professional_status = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'bio', 'avatar', 'country', 'professional_status',
            'followers_count', 'following_count', 'recipes_count',
            'is_following', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'email']
        
    id = serializers.UUIDField(source='uuid', read_only=True)
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(
                follower=request.user,
                following=obj,
                is_active=True
            ).exists()
        return False


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour du profil"""
    professional_status = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name',
            'bio', 'avatar', 'country', 'professional_status'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password_confirm']
        
    id = serializers.UUIDField(source='uuid', read_only=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {"password": "Les mots de passe ne correspondent pas."}
            )
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class FollowSerializer(serializers.ModelSerializer):
    """Serializer pour les relations de suivi"""
    follower = UserMinimalSerializer(read_only=True)
    following = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = Follow

        fields = ['id', 'follower', 'following', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class FollowToggleSerializer(serializers.Serializer):
    """Serializer pour basculer le statut de suivi"""
    following = serializers.BooleanField(read_only=True)
    message = serializers.CharField(read_only=True)


class UserRecommendationSerializer(serializers.ModelSerializer):
    """Serializer pour les recommandations d'utilisateurs"""
    stats = UserStatsSerializer(source='*', read_only=True)
    is_following = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'bio', 'stats', 'is_following']
        
    id = serializers.UUIDField(source='uuid', read_only=True)

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(
                follower=request.user,
                following=obj,
                is_active=True
            ).exists()
        return False


# Serializers pour l'historique (anti-suppression)

class UserBioSerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des bios"""
    class Meta:
        model = UserBio
        fields = ['id', 'bio', 'is_current', 'created_at']


class UserAvatarSerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des avatars"""
    class Meta:
        model = UserAvatar
        fields = ['id', 'avatar', 'is_current', 'created_at']


class UserProfessionalStatusSerializer(serializers.ModelSerializer):
    """Serializer pour les statuts professionnels"""
    class Meta:
        model = UserProfessionalStatus
        fields = ['id', 'status', 'is_active', 'created_at']


class UserLocationSerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des localisations"""
    class Meta:
        model = UserLocation
        fields = ['id', 'country', 'city', 'is_current', 'created_at']


class UserActivityLogSerializer(serializers.ModelSerializer):
    """Serializer pour le journal d'activité"""
    class Meta:
        model = UserActivityLog
        fields = ['id', 'activity_type', 'description', 'created_at']
