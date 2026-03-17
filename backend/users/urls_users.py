"""
URL configuration for Users app (User management endpoints)
"""
from django.urls import path
from .views import (
    UserProfileView, FollowToggleView, UserRecommendationsView,
    UserRecipesView, UserFollowersView, UserFollowingView
)

urlpatterns = [
    # User profile
    path('<str:username>/', UserProfileView.as_view(), name='user-profile'),
    path('<str:username>/recipes/', UserRecipesView.as_view(), name='user-recipes'),
    path('<str:username>/followers/', UserFollowersView.as_view(), name='user-followers'),
    path('<str:username>/following/', UserFollowingView.as_view(), name='user-following'),
    
    # Follow/Unfollow
    path('<uuid:user_id>/follow/', FollowToggleView.as_view(), name='follow-toggle'),
    
    # Recommendations
    path('recommendations/all/', UserRecommendationsView.as_view(), name='user-recommendations'),
]
