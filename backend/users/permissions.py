"""
Custom permissions for Users app
"""
from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission qui permet uniquement au propriétaire de modifier l'objet.
    """
    def has_object_permission(self, request, view, obj):
        # Les requêtes en lecture sont toujours autorisées
        if request.method in permissions.SAFE_METHODS:
            return True
        # Les requêtes d'écriture sont réservées au propriétaire
        return obj == request.user


class IsSameUserOrReadOnly(permissions.BasePermission):
    """
    Permission qui vérifie si l'utilisateur est le même que celui de la requête.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
