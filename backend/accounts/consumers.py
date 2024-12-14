from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Notification
from .serializers import NotificationSerializer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            self.group_name = f"user_{self.user.id}"

            # WebSocket グループにユーザーを追加
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        # グループから削除
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def send_notification(self, event):
        # イベントから通知データを取得し送信
        notification_data = event["notification"]
        await self.send(text_data=json.dumps(notification_data))

    async def receive(self, text_data):
        # クライアントからのメッセージ受信（必要なら処理を追加）
        pass
