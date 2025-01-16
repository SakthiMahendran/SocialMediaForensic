from django.urls import path
from . import views

urlpatterns = [
    path('api/upload/', views.upload_url, name='upload_url'),
    path('api/history/', views.history, name='history'),
]
