"""
URL configuration for Stories app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoryViewSet, StoryDetailView

router = DefaultRouter()
router.register(r'', StoryViewSet, basename='story')

urlpatterns = [
    path('', include(router.urls)),
    # Story detail endpoint
    path('<uuid:story_id>/detail/', StoryDetailView.as_view(), name='story-detail'),
]
