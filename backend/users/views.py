"""
Views for Users app
"""
from rest_framework import generics, status, views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from django.utils import timezone

from .models import Follow, UserActivityLog
from .serializers import (
    UserSerializer, UserProfileSerializer, UserRegistrationSerializer,
    FollowToggleSerializer, UserRecommendationSerializer,
    UserStatsSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Inscription d'un nouvel utilisateur
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Créer le log d'activité
        UserActivityLog.objects.create(
            user=user,
            activity_type='login',
            description='User registered',
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Générer les tokens JWT
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_201_CREATED)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class CurrentUserView(views.APIView):
    """
    GET /api/auth/me/
    PATCH /api/auth/me/
    Récupérer ou mettre à jour le profil de l'utilisateur connecté
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    def patch(self, request):
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Gérer l'upload d'avatar
        if 'avatar' in request.FILES:
            from .models import UserAvatar
            UserAvatar.objects.create(user=user, avatar=request.FILES['avatar'])
            user.avatar = request.FILES['avatar']
            user.save()
        
        # Gérer la bio
        if 'bio' in request.data:
            from .models import UserBio
            UserBio.objects.create(user=user, bio=request.data['bio'])
        
        # Gérer les statuts professionnels
        if 'professional_status' in request.data:
            from .models import UserProfessionalStatus
            statuses = request.data['professional_status']
            # Désactiver les anciens statuts
            UserProfessionalStatus.objects.filter(user=user).update(is_active=False)
            # Créer les nouveaux
            for status in statuses:
                UserProfessionalStatus.objects.get_or_create(
                    user=user,
                    status=status,
                    defaults={'is_active': True}
                )
        
        # Gérer la localisation
        if 'country' in request.data:
            from .models import UserLocation
            UserLocation.objects.create(
                user=user,
                country=request.data['country'],
                city=request.data.get('city', '')
            )
        
        # Log d'activité
        UserActivityLog.objects.create(
            user=user,
            activity_type='profile_update',
            description='Profile updated',
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response(UserSerializer(user, context={'request': request}).data)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class UserProfileView(views.APIView):
    """
    GET /api/users/{username}/
    Voir le profil d'un autre utilisateur
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, username):
        try:
            user = User.objects.get(
                username=username,
                is_active=True,
                is_deleted=False
            )
        except User.DoesNotExist:
            raise NotFound("Utilisateur non trouvé")
        
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)


class FollowToggleView(views.APIView):
    """
    POST /api/users/{id}/follow/
    Suivre ou ne plus suivre un utilisateur
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        try:
            target_user = User.objects.get(
                uuid=user_id,
                is_active=True,
                is_deleted=False
            )
        except User.DoesNotExist:
            raise NotFound("Utilisateur non trouvé")
        
        if target_user == request.user:
            return Response(
                {"error": "Vous ne pouvez pas vous suivre vous-même"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Chercher une relation existante
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=target_user,
            defaults={'is_active': True}
        )
        
        if not created:
            # Basculer l'état
            follow.is_active = not follow.is_active
            if not follow.is_active:
                follow.unfollowed_at = timezone.now()
            follow.save()
        
        # Créer une notification si on suit
        if follow.is_active:
            from notifications.utils import create_notification
            create_notification(
                recipient=target_user,
                actor=request.user,
                notification_type='follow'
            )
        
        message = "Vous suivez maintenant cet utilisateur" if follow.is_active else "Vous ne suivez plus cet utilisateur"
        
        return Response({
            'following': follow.is_active,
            'message': message
        })


class UserRecommendationsView(views.APIView):
    """
    GET /api/users/recommendations/
    Récupérer des recommandations de chefs à suivre
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Récupérer les IDs des personnes que l'utilisateur suit déjà (via le modèle Follow)
        following_ids = Follow.objects.filter(
            follower=request.user,
            is_active=True
        ).values_list('following_id', flat=True)
        
        # Recommander des utilisateurs populaires (exclure les admins, soi-même et ceux déjà suivis)
        recommended = User.objects.filter(
            is_active=True,
            is_deleted=False,
            is_superuser=False,
            is_staff=False
        ).exclude(
            id=request.user.id
        ).exclude(
            id__in=following_ids
        ).annotate(
            followers_count=Count('followers')
        ).order_by('-followers_count')[:20]
        
        serializer = UserRecommendationSerializer(recommended, many=True)
        return Response(serializer.data)


class UserRecipesView(views.APIView):
    """
    GET /api/users/{username}/recipes/
    Récupérer les recettes d'un utilisateur
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, username):
        try:
            user = User.objects.get(
                username=username,
                is_active=True,
                is_deleted=False
            )
        except User.DoesNotExist:
            raise NotFound("Utilisateur non trouvé")
        
        from recipes.models import Recipe
        from recipes.serializers import RecipeSerializer
        
        recipes = Recipe.objects.filter(
            author=user,
            is_deleted=False,
            is_published=True
        ).order_by('-created_at')
        
        serializer = RecipeSerializer(
            recipes,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)


class UserFollowersView(views.APIView):
    """
    GET /api/users/{username}/followers/
    Récupérer la liste des followers
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, username):
        try:
            user = User.objects.get(
                username=username,
                is_active=True,
                is_deleted=False
            )
        except User.DoesNotExist:
            raise NotFound("Utilisateur non trouvé")
        
        follower_ids = Follow.objects.filter(
            following=user,
            is_active=True
        ).values_list('follower_id', flat=True)
        
        followers = User.objects.filter(
            id__in=follower_ids,
            is_active=True,
            is_deleted=False
        )
        
        serializer = UserRecommendationSerializer(followers, many=True)
        return Response(serializer.data)


class UserFollowingView(views.APIView):
    """
    GET /api/users/{username}/following/
    Récupérer la liste des utilisateurs suivis
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, username):
        try:
            user = User.objects.get(
                username=username,
                is_active=True,
                is_deleted=False
            )
        except User.DoesNotExist:
            raise NotFound("Utilisateur non trouvé")
        
        following_ids = Follow.objects.filter(
            follower=user,
            is_active=True
        ).values_list('following_id', flat=True)
        
        following = User.objects.filter(
            id__in=following_ids,
            is_active=True,
            is_deleted=False
        )
        
        serializer = UserRecommendationSerializer(following, many=True)
        return Response(serializer.data)
