"""
Views for Stories app
"""
from rest_framework import generics, status, views, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Prefetch, Exists, OuterRef
from django.utils import timezone
from datetime import timedelta

from .models import Story, StoryView, StoryReaction, StoryMention
from .serializers import (
    StorySerializer, StoryCreateSerializer, StoryGroupSerializer,
    StoryFeedSerializer, StoryReactionCreateSerializer,
    StoryReactionToggleSerializer
)
from users.serializers import UserMinimalSerializer

User = get_user_model()


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class StoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les stories (Kitchen Moments)
    """
    queryset = Story.objects.filter(is_deleted=False)
    serializer_class = StorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    lookup_field = 'uuid'
    
    def get_queryset(self):
        """Récupérer uniquement les stories non expirées et non supprimées"""
        return Story.objects.filter(
            is_deleted=False,
            expires_at__gt=timezone.now()
        )
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StoryCreateSerializer
        return StorySerializer
    
    def perform_create(self, serializer):
        story = serializer.save(author=self.request.user)
        return story
    
    def destroy(self, request, *args, **kwargs):
        """Suppression logique (soft delete)"""
        story = self.get_object()
        
        if story.author != request.user:
            raise PermissionDenied("Vous ne pouvez pas supprimer cette story")
        
        story.soft_delete(user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def feed(self, request):
        """
        GET /api/stories/feed/
        Récupérer les stories actives groupées par utilisateur
        """
        # Récupérer les stories des dernières 24h
        cutoff_time = timezone.now() - timedelta(hours=24)
        
        # Stories des utilisateurs suivis + les siennes
        following_ids = list(request.user.following.filter(
            is_active=True,
            is_deleted=False
        ).values_list('uuid', flat=True))
        following_ids.append(request.user.uuid)
        
        stories = Story.objects.filter(
            author__uuid__in=following_ids,
            is_deleted=False,
            expires_at__gt=timezone.now()
        ).select_related('author').annotate(
            has_viewed=Exists(
                StoryView.objects.filter(
                    story=OuterRef('pk'),
                    user=request.user
                )
            )
        ).order_by('author', '-created_at')
        
        # Grouper par utilisateur
        story_groups = {}
        for story in stories:
            author_uuid = str(story.author.uuid)
            if author_uuid not in story_groups:
                story_groups[author_uuid] = {
                    'user': story.author,
                    'stories': [],
                    'has_unseen': False
                }
            story_groups[author_uuid]['stories'].append(story)
            if not story.has_viewed:
                story_groups[author_uuid]['has_unseen'] = True
        
        # Convertir en liste et sérialiser
        result = []
        for group in story_groups.values():
            result.append({
                'user': UserMinimalSerializer(group['user']).data,
                'stories': StorySerializer(
                    group['stories'],
                    many=True,
                    context={'request': request}
                ).data,
                'has_unseen': group['has_unseen']
            })
        
        # Trier: d'abord ceux avec des stories non vues
        result.sort(key=lambda x: not x['has_unseen'])
        
        return Response({'story_groups': result})
    
    @action(detail=True, methods=['post'])
    def view(self, request, **kwargs):
        """
        POST /api/stories/{id}/view/
        Marquer une story comme vue
        """
        story = self.get_object()
        
        # Créer la vue si elle n'existe pas
        view, created = StoryView.objects.get_or_create(
            story=story,
            user=request.user
        )
        
        # Créer une notification si c'est la première vue
        if created and story.author != request.user:
            from notifications.utils import create_notification
            extra = {}
            if story.media:
                extra['preview_image'] = story.media.url
            create_notification(
                recipient=story.author,
                actor=request.user,
                notification_type='story_view',
                target=story,
                extra_data=extra
            )
        
        return Response({
            'viewed': True,
            'views_count': story.views_count
        })
    
    @action(detail=True, methods=['post'])
    def react(self, request, **kwargs):
        """
        POST /api/stories/{id}/react/
        Réagir à une story
        """
        story = self.get_object()
        
        serializer = StoryReactionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reaction_type = serializer.validated_data.get('reaction_type', 'like')
        
        reaction, created = StoryReaction.objects.get_or_create(
            story=story,
            user=request.user,
            defaults={'reaction_type': reaction_type, 'is_active': True}
        )
        
        if not created:
            if reaction.reaction_type == reaction_type and reaction.is_active:
                # Même réaction, on la désactive (toggle off)
                reaction.is_active = False
                reaction.save()
                message = "Réaction retirée"
            else:
                # Nouvelle réaction ou réactivation
                reaction.reaction_type = reaction_type
                reaction.is_active = True
                reaction.save()
                message = f"Réaction {reaction_type} ajoutée"
        else:
            message = f"Réaction {reaction_type} ajoutée"
            # Créer une notification
            if story.author != request.user:
                from notifications.utils import create_notification
                extra = {'reaction_type': reaction_type}
                if story.media:
                    extra['preview_image'] = story.media.url
                create_notification(
                    recipient=story.author,
                    actor=request.user,
                    notification_type='story_reaction',
                    target=story,
                    extra_data=extra
                )
        
        return Response({
            'reaction_type': reaction.reaction_type if reaction.is_active else None,
            'is_active': reaction.is_active,
            'message': message
        })
    
    @action(detail=False, methods=['get'])
    def my_stories(self, request):
        """
        GET /api/stories/my_stories/
        Récupérer mes stories actives
        """
        stories = Story.objects.filter(
            author=request.user,
            is_deleted=False,
            expires_at__gt=timezone.now()
        ).order_by('-created_at')
        
        serializer = StorySerializer(
            stories,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def user_stories(self, request):
        """
        GET /api/stories/user_stories/?username=chef_moussa
        Récupérer les stories d'un utilisateur spécifique
        """
        username = request.query_params.get('username')
        if not username:
            return Response(
                {'error': 'Le paramètre username est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(
                username=username,
                is_active=True,
                is_deleted=False
            )
        except User.DoesNotExist:
            raise NotFound("Utilisateur non trouvé")
        
        stories = Story.objects.filter(
            author=user,
            is_deleted=False,
            expires_at__gt=timezone.now()
        ).order_by('created_at')  # Ordre chronologique pour la visualisation
        
        serializer = StorySerializer(
            stories,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)


class StoryDetailView(views.APIView):
    """
    GET /api/stories/{id}/
    Récupérer une story spécifique
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, story_id):
        try:
            story = Story.objects.get(
                uuid=story_id,
                is_deleted=False,
                expires_at__gt=timezone.now()
            )
        except Story.DoesNotExist:
            raise NotFound("Story non trouvée ou expirée")
        
        serializer = StorySerializer(story, context={'request': request})
        return Response(serializer.data)
