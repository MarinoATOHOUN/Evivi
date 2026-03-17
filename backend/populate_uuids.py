
import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from recipes.models import Recipe

User = get_user_model()

print("Populating User UUIDs...")
users = User.objects.filter(uuid__isnull=True)
for user in users:
    user.uuid = uuid.uuid4()
    user.save()
print(f"Updated {users.count()} users.")

print("Populating Recipe UUIDs...")
recipes = Recipe.objects.filter(uuid__isnull=True)
for recipe in recipes:
    recipe.uuid = uuid.uuid4()
    recipe.save()
print(f"Updated {recipes.count()} recipes.")
