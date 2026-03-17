"""
URL configuration for Recipes app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RecipeViewSet, CategoryViewSet, CommentDeleteView
)

router = DefaultRouter()
router.register(r'', RecipeViewSet, basename='recipe')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
    # Comment delete endpoint (not in ViewSet)
    path('comments/<uuid:comment_id>/', CommentDeleteView.as_view(), name='comment-delete'),
]
