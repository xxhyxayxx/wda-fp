from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Notification
from .serializers import NotificationSerializer
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user", AnonymousUser())
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

    async def receive(self, text_data):
        """
        クライアントからのメッセージを受信し、通知を登録する
        """
        data = json.loads(text_data)
        title = data.get('title')
        message = data.get('message')
        link = data.get('link')

        if not (title and message):  # タイトルとメッセージは必須
            await self.send(text_data=json.dumps({"error": "Title and message are required."}))
            return

        # 通知をデータベースに保存
        notification = await sync_to_async(Notification.objects.create)(
            user=self.user,
            title=title,
            message=message,
            link=link
        )

        # 作成された通知をシリアライズ
        serializer = NotificationSerializer(notification)

        # 通知をユーザーにリアルタイムで送信
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "send_notification",
                "notification": serializer.data,
            }
        )

    async def send_notification(self, event):
        """
        グループ内の全クライアントに通知を送信
        """
        notification_data = event["notification"]
        await self.send(text_data=json.dumps(notification_data))
