from django.contrib.auth.models import AbstractUser
from django.db import models

class ForensicData(models.Model):
    url_id = models.AutoField(primary_key=True)
    url = models.URLField(unique=True)
    summary = models.TextField()

    def __str__(self):
        return self.url

class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)  # Use hashed passwords in production
    email = models.EmailField(unique=True)

