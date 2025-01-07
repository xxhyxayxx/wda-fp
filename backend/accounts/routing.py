from django.urls import path
from .consumers import NotificationConsumer, MessageConsumer

websocket_urlpatterns = [
    path("accounts/ws/notifications/", NotificationConsumer.as_asgi()),
    path("accounts/ws/messages/<str:chat_id>/", MessageConsumer.as_asgi()),
]
