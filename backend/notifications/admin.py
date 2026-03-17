"""
Admin configuration for Notifications app
"""
from django.contrib import admin
from .models import Notification, NotificationPreference, NotificationHistory


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'actor', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'is_archived']
    search_fields = ['recipient__username', 'actor__username', 'message']


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'digest_frequency', 'is_active']
    list_filter = ['digest_frequency', 'is_active']


@admin.register(NotificationHistory)
class NotificationHistoryAdmin(admin.ModelAdmin):
    list_display = ['notification', 'action', 'channel', 'created_at']
    list_filter = ['action', 'channel']
