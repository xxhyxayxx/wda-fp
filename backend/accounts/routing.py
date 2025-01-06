from django.urls import path
from .consumers import NotificationConsumer

websocket_urlpatterns = [
    path("accounts/ws/notifications/", NotificationConsumer.as_asgi()),
]
