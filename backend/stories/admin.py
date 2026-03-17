"""
Admin configuration for Stories app
"""
from django.contrib import admin
from .models import Story, StoryView, StoryReaction, StoryMention


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'media_type', 'is_deleted', 'created_at', 'expires_at']
    list_filter = ['media_type', 'is_deleted']
    search_fields = ['author__username', 'caption']


@admin.register(StoryView)
class StoryViewAdmin(admin.ModelAdmin):
    list_display = ['story', 'user', 'viewed_at']
    list_filter = ['viewed_at']


@admin.register(StoryReaction)
class StoryReactionAdmin(admin.ModelAdmin):
    list_display = ['story', 'user', 'reaction_type', 'is_active']
    list_filter = ['reaction_type', 'is_active']


@admin.register(StoryMention)
class StoryMentionAdmin(admin.ModelAdmin):
    list_display = ['story', 'mentioned_user', 'created_at']
