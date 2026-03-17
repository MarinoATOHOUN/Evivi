
import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from recipes.models import Recipe, Comment
from stories.models import Story

User = get_user_model()

print("Regenerating User UUIDs...")
for user in User.objects.all():
    user.uuid = uuid.uuid4()
    user.save()

print("Regenerating Recipe UUIDs...")
for recipe in Recipe.objects.all():
    recipe.uuid = uuid.uuid4()
    recipe.save()

print("Regenerating Comment UUIDs...")
for comment in Comment.objects.all():
    comment.uuid = uuid.uuid4()
    comment.save()

print("Regenerating Story UUIDs...")
for story in Story.objects.all():
    story.uuid = uuid.uuid4()
    story.save()

print("All UUIDs regenerated uniquely.")
