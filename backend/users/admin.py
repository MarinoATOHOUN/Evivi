"""
Admin configuration for Users app
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, UserBio, UserAvatar, UserProfessionalStatus,
    UserLocation, Follow, UserActivityLog
)


class UserBioInline(admin.TabularInline):
    model = UserBio
    extra = 0
    readonly_fields = ['created_at']


class UserAvatarInline(admin.TabularInline):
    model = UserAvatar
    extra = 0
    readonly_fields = ['created_at']


class UserProfessionalStatusInline(admin.TabularInline):
    model = UserProfessionalStatus
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'is_active', 'is_deleted', 'created_at']
    list_filter = ['is_active', 'is_deleted', 'professional_status']
    search_fields = ['username', 'email', 'bio']
    inlines = [UserBioInline, UserAvatarInline, UserProfessionalStatusInline]
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Evivi Profile', {
            'fields': ('bio', 'avatar', 'country', 'professional_status', 'is_deleted', 'deleted_at')
        }),
    )


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ['follower', 'following', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['follower__username', 'following__username']


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'activity_type', 'created_at']
    list_filter = ['activity_type']
    search_fields = ['user__username', 'description']
