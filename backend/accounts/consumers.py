from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import Message, CustomUser

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
        from .models import Notification  # 必要なときにインポート
        from .serializers import NotificationSerializer  # 必要なときにインポート

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

class MessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']

        if self.user.is_authenticated:
            self.chat_group_name = f"chat_{self.chat_id}"

            # チャットグループにユーザーを追加
            await self.channel_layer.group_add(
                self.chat_group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                self.chat_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data.get("content")
        receiver_id = data.get("receiver_id")

        if not message_content or not receiver_id:
            await self.send(text_data=json.dumps({"error": "Content and receiver_id are required"}))
            return

        # メッセージを保存
        receiver = await sync_to_async(CustomUser.objects.get)(id=receiver_id)
        message = await sync_to_async(Message.objects.create)(
            sender=self.user,
            receiver=receiver,
            content=message_content
        )

        # グループ内でメッセージを送信
        await self.channel_layer.group_send(
            self.chat_group_name,
            {
                "type": "chat_message",
                "message": {
                    "id": message.id,
                    "sender": self.user.id,
                    "receiver": receiver.id,
                    "content": message.content,
                    "timestamp": str(message.timestamp),
                    "is_read": message.is_read,
                }
            }
        )

    async def chat_message(self, event):
        # クライアントにメッセージを送信
        await self.send(text_data=json.dumps(event["message"]))
