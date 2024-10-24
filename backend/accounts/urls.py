from django.urls import path
from .views import UserRegistrationAPIView, UserProfileUpdateAPIView, LogoutAPIView, ChangePasswordAPIView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('register/', UserRegistrationAPIView.as_view(), name='user-register'),
    path('profile/update/', UserProfileUpdateAPIView.as_view(), name='user-profile-update'),
    path('login/', obtain_auth_token, name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
]
