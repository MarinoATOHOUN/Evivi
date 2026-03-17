"""
Views for Notifications app
"""
from rest_framework import generics, status, views, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

from .models import Notification, NotificationPreference, NotificationHistory
from .serializers import (
    NotificationSerializer, NotificationMarkReadSerializer,
    NotificationPreferenceSerializer, NotificationGroupedSerializer
)

User = get_user_model()


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les notifications
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Récupérer les notifications de l'utilisateur connecté"""
        return Notification.objects.filter(
            recipient=self.request.user,
            is_archived=False
        ).select_related('actor').order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def grouped(self, request):
        """
        GET /api/notifications/grouped/
        Récupérer les notifications groupées par période
        """
        notifications = self.get_queryset()
        
        # Définir les périodes
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday_start = today_start - timedelta(days=1)
        week_start = today_start - timedelta(days=7)
        
        # Grouper les notifications
        today = notifications.filter(created_at__gte=today_start)
        yesterday = notifications.filter(
            created_at__gte=yesterday_start,
            created_at__lt=today_start
        )
        this_week = notifications.filter(
            created_at__gte=week_start,
            created_at__lt=yesterday_start
        )
        earlier = notifications.filter(created_at__lt=week_start)
        
        unread_count = notifications.filter(is_read=False).count()
        
        return Response({
            'today': NotificationSerializer(today, many=True).data,
            'yesterday': NotificationSerializer(yesterday, many=True).data,
            'this_week': NotificationSerializer(this_week, many=True).data,
            'earlier': NotificationSerializer(earlier, many=True).data,
            'unread_count': unread_count
        })
    
    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        """
        POST /api/notifications/mark_read/
        Marquer des notifications comme lues
        """
        serializer = NotificationMarkReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        notification_ids = serializer.validated_data.get('notification_ids', [])
        mark_all = serializer.validated_data.get('mark_all', False)
        
        if mark_all:
            # Marquer toutes les notifications non lues
            notifications = Notification.objects.filter(
                recipient=request.user,
                is_read=False,
                is_archived=False
            )
        elif notification_ids:
            # Marquer les notifications spécifiées
            notifications = Notification.objects.filter(
                id__in=notification_ids,
                recipient=request.user,
                is_archived=False
            )
        else:
            return Response(
                {'error': 'Veuillez spécifier des IDs ou mark_all=true'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        count = notifications.count()
        for notification in notifications:
            notification.mark_as_read()
        
        return Response({
            'marked_as_read': count,
            'message': f'{count} notification(s) marquée(s) comme lue(s)'
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """
        POST /api/notifications/mark_all_read/
        Marquer toutes les notifications comme lues
        """
        notifications = Notification.objects.filter(
            recipient=request.user,
            is_read=False,
            is_archived=False
        )
        
        count = notifications.count()
        for notification in notifications:
            notification.mark_as_read()
        
        return Response({
            'marked_as_read': count,
            'message': f'{count} notification(s) marquée(s) comme lue(s)'
        })
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """
        POST /api/notifications/{id}/archive/
        Archiver une notification
        """
        notification = self.get_object()
        notification.archive()
        
        return Response({
            'archived': True,
            'message': 'Notification archivée'
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        GET /api/notifications/unread_count/
        Récupérer le nombre de notifications non lues
        """
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False,
            is_archived=False
        ).count()
        
        return Response({'unread_count': count})


class NotificationPreferenceView(views.APIView):
    """
    GET /api/notifications/preferences/
    PUT /api/notifications/preferences/
    Gérer les préférences de notification
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Récupérer les préférences de l'utilisateur"""
        preferences, created = NotificationPreference.objects.get_or_create(
            user=request.user
        )
        serializer = NotificationPreferenceSerializer(preferences)
        return Response(serializer.data)
    
    def put(self, request):
        """Mettre à jour les préférences"""
        preferences, created = NotificationPreference.objects.get_or_create(
            user=request.user
        )
        
        serializer = NotificationPreferenceSerializer(
            preferences,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)


# Utilitaire pour créer des notifications

def create_notification(recipient, actor, notification_type, target=None, message=None):
    """
    Créer une notification
    
    Args:
        recipient: User - destinataire de la notification
        actor: User - utilisateur qui a déclenché l'action
        notification_type: str - type de notification
        target: object optionnel - objet cible (recette, story, etc.)
        message: str optionnel - message personnalisé
    """
    from django.contrib.contenttypes.models import ContentType
    
    notification_data = {
        'recipient': recipient,
        'actor': actor,
        'notification_type': notification_type,
        'message': message
    }
    
    if target:
        notification_data['target_content_type'] = ContentType.objects.get_for_model(target)
        notification_data['target_object_id'] = target.id
    
    notification = Notification.objects.create(**notification_data)
    
    # Créer l'historique
    NotificationHistory.objects.create(
        notification=notification,
        action='created',
        channel='in_app'
    )
    
    return notification
