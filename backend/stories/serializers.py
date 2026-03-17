"""
Serializers for Stories app
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Story, StoryCaption, StoryStyle, StoryView, 
    StoryReaction, StoryMention
)
from users.serializers import UserMinimalSerializer

User = get_user_model()


class StoryStyleSerializer(serializers.ModelSerializer):
    """Serializer pour les styles de story"""
    class Meta:
        model = StoryStyle
        fields = ['font_style', 'font_color', 'background_color', 'text_position']


class StoryReactionSerializer(serializers.ModelSerializer):
    """Serializer pour les réactions aux stories"""
    user = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = StoryReaction
        fields = ['id', 'user', 'reaction_type', 'created_at']


class StoryViewSerializer(serializers.ModelSerializer):
    """Serializer pour les vues de stories"""
    user = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = StoryView
        fields = ['id', 'user', 'viewed_at']


class StoryMentionSerializer(serializers.ModelSerializer):
    """Serializer pour les mentions dans les stories"""
    mentioned_user = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = StoryMention
        fields = ['id', 'mentioned_user', 'created_at']


class StoryMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour les stories"""
    class Meta:
        model = Story
        fields = ['id', 'media', 'media_type', 'caption', 'created_at', 'expires_at']
        
    id = serializers.UUIDField(source='uuid', read_only=True)


class StorySerializer(serializers.ModelSerializer):
    """Serializer complet pour les stories"""
    author = UserMinimalSerializer(read_only=True)
    views_count = serializers.IntegerField(read_only=True)
    has_viewed = serializers.SerializerMethodField()
    reactions = StoryReactionSerializer(source='reactions_story', many=True, read_only=True)
    
    class Meta:
        model = Story
        fields = [
            'id', 'author', 'media', 'media_type', 'caption',
            'font_style', 'font_color', 'background_color', 'text_position',
            'views_count', 'has_viewed', 'reactions',
            'created_at', 'expires_at', 'is_expired'
        ]
        
    id = serializers.UUIDField(source='uuid', read_only=True)
    
    def get_has_viewed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return StoryView.objects.filter(
                story=obj,
                user=request.user
            ).exists()
        return False


class StoryCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de stories"""
    mentioned_usernames = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Story
        fields = [
            'id', 'media', 'media_type', 'caption',
            'font_style', 'font_color', 'background_color', 'text_position',
            'mentioned_usernames'
        ]
        extra_kwargs = {
            'media': {'required': False, 'allow_null': True},
        }
        
    id = serializers.UUIDField(source='uuid', read_only=True)

    def validate_text_position(self, value):
        if isinstance(value, str):
            import json
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return {}
        return value

    def validate(self, attrs):
        media_type = attrs.get('media_type')
        media = attrs.get('media')
        caption = attrs.get('caption')

        if media_type in ['image', 'video'] and not media:
            raise serializers.ValidationError({"media": f"Un fichier média est requis pour le type {media_type}."})
        
        if media_type == 'text' and not caption:
            raise serializers.ValidationError({"caption": "Une légende est requise pour une story de type texte."})
            
        return attrs
    
    def create(self, validated_data):
        mentioned_usernames = validated_data.pop('mentioned_usernames', [])
        story = Story.objects.create(**validated_data)
        
        # Créer les historiques
        StoryCaption.objects.create(story=story, caption=story.caption or "")
        StoryStyle.objects.create(
            story=story,
            font_style=story.font_style,
            font_color=story.font_color,
            background_color=story.background_color,
            text_position=story.text_position
        )
        
        # Créer les mentions et notifications
        from notifications.utils import create_notification
        for username in mentioned_usernames:
            try:
                user = User.objects.get(username=username, is_active=True, is_deleted=False)
                StoryMention.objects.create(story=story, mentioned_user=user)
                
                # Notification de mention
                create_notification(
                    recipient=user,
                    actor=story.author,
                    notification_type='mention',
                    target=story
                )
            except User.DoesNotExist:
                pass
        
        return story


class StoryGroupSerializer(serializers.Serializer):
    """Serializer pour grouper les stories par utilisateur"""
    user = UserMinimalSerializer()
    stories = StoryMinimalSerializer(many=True)
    has_unseen = serializers.BooleanField()


class StoryFeedSerializer(serializers.Serializer):
    """Serializer pour le feed de stories"""
    story_groups = StoryGroupSerializer(many=True)


class StoryViewCreateSerializer(serializers.Serializer):
    """Serializer pour créer une vue de story"""
    story_id = serializers.IntegerField()


class StoryReactionCreateSerializer(serializers.Serializer):
    """Serializer pour créer une réaction à une story"""
    reaction_type = serializers.ChoiceField(
        choices=StoryReaction.REACTION_TYPES,
        default='like'
    )


class StoryReactionToggleSerializer(serializers.Serializer):
    """Serializer pour la réponse de basculement de réaction"""
    reaction_type = serializers.CharField()
    is_active = serializers.BooleanField()
    message = serializers.CharField()


# Serializers pour l'historique (anti-suppression)

class StoryCaptionSerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des légendes"""
    class Meta:
        model = StoryCaption
        fields = ['id', 'caption', 'is_current', 'created_at']


class StoryStyleHistorySerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des styles"""
    class Meta:
        model = StoryStyle
        fields = ['id', 'font_style', 'font_color', 'text_position', 'is_current', 'created_at']
