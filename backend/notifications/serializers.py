"""
Serializers for Notifications app
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Notification, NotificationPreference, 
    NotificationHistory, NotificationBatch
)
from users.serializers import UserMinimalSerializer
from recipes.serializers import RecipeMinimalSerializer

User = get_user_model()


class NotificationTargetSerializer(serializers.Serializer):
    """Serializer générique pour les cibles de notification"""
    id = serializers.CharField()
    type = serializers.CharField()
    title = serializers.CharField(required=False)


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer complet pour les notifications"""
    actor = UserMinimalSerializer(read_only=True)
    target_recipe = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'actor', 'target_recipe',
            'message', 'extra_data', 'is_read', 'read_at',
            'created_at', 'updated_at'
        ]
    
    def get_target_recipe(self, obj):
        """Récupérer la recette cible si c'est une recette"""
        if obj.target and hasattr(obj.target, 'title'):
            return {
                'id': str(obj.target.uuid) if hasattr(obj.target, 'uuid') else obj.target.id,
                'title': obj.target.title
            }
        return None


class NotificationMarkReadSerializer(serializers.Serializer):
    """Serializer pour marquer les notifications comme lues"""
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    mark_all = serializers.BooleanField(default=False)


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer pour les préférences de notification"""
    class Meta:
        model = NotificationPreference
        fields = [
            'email_follow', 'email_recipe_like', 'email_recipe_comment',
            'email_story_reaction', 'email_mention',
            'push_follow', 'push_recipe_like', 'push_recipe_comment',
            'push_story_reaction', 'push_mention',
            'digest_frequency', 'is_active'
        ]


class NotificationHistorySerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des notifications"""
    class Meta:
        model = NotificationHistory
        fields = ['id', 'action', 'channel', 'details', 'created_at']


class NotificationBatchSerializer(serializers.ModelSerializer):
    """Serializer pour les batchs de notifications"""
    notifications = NotificationSerializer(many=True, read_only=True)
    
    class Meta:
        model = NotificationBatch
        fields = ['id', 'batch_type', 'notifications', 'is_sent', 'sent_at', 'created_at']


class NotificationGroupedSerializer(serializers.Serializer):
    """Serializer pour les notifications groupées par période"""
    today = NotificationSerializer(many=True)
    yesterday = NotificationSerializer(many=True)
    this_week = NotificationSerializer(many=True)
    earlier = NotificationSerializer(many=True)
    unread_count = serializers.IntegerField()
