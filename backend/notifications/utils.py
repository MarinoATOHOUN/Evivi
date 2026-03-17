"""
Utility functions for Notifications app
"""
from django.contrib.contenttypes.models import ContentType
from .models import Notification, NotificationHistory


def create_notification(recipient, actor, notification_type, target=None, message=None, extra_data=None):
    """
    Créer une notification avec support du regroupement
    """
    from django.utils import timezone
    from datetime import timedelta
    
    if extra_data is None:
        extra_data = {}
        
    # Déterminer la clé de groupe pour l'agrégation
    group_key = None
    if target:
        group_key = f"{notification_type}_{target.id}"
    elif notification_type == 'follow':
        group_key = f"follow_{recipient.id}"

    # Tenter de trouver une notification récente du même type (dernières 24h)
    if group_key:
        recent_cutoff = timezone.now() - timedelta(hours=24)
        existing = Notification.objects.filter(
            recipient=recipient,
            notification_type=notification_type,
            group_key=group_key,
            created_at__gt=recent_cutoff,
            is_read=False # On ne regroupe que sur les non lues
        ).first()
        
        if existing:
            # Mettre à jour l'existant
            actors = existing.extra_data.get('other_actors', [])
            if actor.username not in actors and actor.id != existing.actor.id:
                actors.append({
                    'id': str(actor.uuid),
                    'username': actor.username,
                    'avatar': actor.avatar.url if actor.avatar else None
                })
                existing.extra_data['other_actors'] = actors
                existing.updated_at = timezone.now()
                existing.save()
                return existing

    # Sinon créer une nouvelle
    notification_data = {
        'recipient': recipient,
        'actor': actor,
        'notification_type': notification_type,
        'message': message,
        'group_key': group_key,
        'extra_data': extra_data
    }
    
    if target:
        notification_data['target_content_type'] = ContentType.objects.get_for_model(target)
        notification_data['target_object_id'] = target.id
        # Ajouter une preview si c'est une recette
        if hasattr(target, 'title') and 'preview_image' not in extra_data:
            from recipes.models import RecipeImage
            img = RecipeImage.objects.filter(recipe_id=target.id).first()
            if img:
                extra_data['preview_image'] = img.image.url
            extra_data['target_title'] = target.title

    notification = Notification.objects.create(**notification_data)
    
    # Historique
    NotificationHistory.objects.create(
        notification=notification,
        action='created',
        channel='in_app'
    )
    
    return notification


def get_notification_message(notification_type, actor_name, target_title=None):
    """
    Générer un message de notification par défaut
    
    Args:
        notification_type: str - type de notification
        actor_name: str - nom de l'acteur
        target_title: str optionnel - titre de la cible
    
    Returns:
        str - message de notification
    """
    messages = {
        'follow': f"{actor_name} a commencé à vous suivre",
        'recipe_like': f"{actor_name} a aimé votre recette" + (f" \"{target_title}\"" if target_title else ""),
        'recipe_comment': f"{actor_name} a commenté votre recette" + (f" \"{target_title}\"" if target_title else ""),
        'story_view': f"{actor_name} a vu votre story",
        'story_reaction': f"{actor_name} a réagi à votre story",
        'mention': f"{actor_name} vous a mentionné",
        'system': "Nouvelle notification système"
    }
    
    return messages.get(notification_type, "Nouvelle notification")
