from django.urls import path
from . import views
from .views import SignUpView, LoginView

urlpatterns = [
    path('api/upload/', views.upload_url, name='upload_url'),
    path('api/history/', views.history, name='history'),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
]


