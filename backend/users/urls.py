"""
URL configuration for Users app (Auth endpoints)
"""
from django.urls import path
from .views import (
    RegisterView, CurrentUserView
)

urlpatterns = [
    # Auth endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
]
