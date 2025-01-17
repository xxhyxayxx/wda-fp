from rest_framework import generics, permissions
from .models import CustomUser, Notification, Message
from .serializers import UserRegistrationSerializer, UserProfileSerializer, ChangePasswordSerializer, NotificationSerializer, MessageSerializer, ConversationSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import TokenAuthentication
from rest_framework.generics import ListAPIView
from .tasks import generate_notification
from rest_framework.generics import RetrieveAPIView
from django.db.models import Q, Max, F, Value
from django.db.models.functions import Greatest
from collections import defaultdict
from cloudinary.uploader import upload

class UserRegistrationAPIView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class LogoutAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.auth.delete()  # トークンを削除
        return Response(status=status.HTTP_204_NO_CONTENT)

class ChangePasswordAPIView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password updated successfully'}, status=status.HTTP_200_OK)

class NotificationListAPIView(ListAPIView):
    """
    認証されたユーザーの通知一覧を返すビュー
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # ログインしているユーザーの通知のみ取得
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class AdminBulkNotificationAPIView(APIView):
    """管理者用一括通知API"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        title = request.data.get("title")
        message = request.data.get("message")
        link = request.data.get("link", "")
        user_ids = request.data.get("user_ids", None)  # ユーザーIDのリスト (任意)

        if not title or not message:
            return Response({"error": "Title and message are required."}, status=400)

        generate_notification.delay(
            event_type="important_announcement",
            title=title,
            message=message,
            link=link,
            user_ids=user_ids
        )

        return Response({"detail": "Notification task has been created."}, status=200)

class MarkNotificationAsReadAPIView(APIView):
    """
    特定の通知を既読にするAPI
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save(update_fields=['is_read'])
            return Response({"detail": "Notification marked as read."}, status=200)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=404)

class ReleaseNewCourseAPIView(APIView):
    permission_classes = [IsAdminUser]  # 管理者のみがアクセス可能

    def post(self, request):
        course_name = request.data.get("course_name")
        if not course_name:
            return Response({"error": "Course name is required."}, status=400)

        # タスクをキューに追加
        generate_notification.delay(
            event_type="course_release",  # イベントタイプ
            title="New Course Released",
            message=f"The course '{course_name}' has just been released!",
            link=f"/courses/{course_name}/",  # 必要に応じてリンクを変更
        )

        return Response({"detail": "Course release notification task created."}, status=200)

class UserSearchAPIView(ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '').strip()

        if not query:  # クエリが空の場合は何も返さない
            return CustomUser.objects.none()

        queryset = CustomUser.objects.filter(
            Q(name__icontains=query) | Q(email__icontains=query)
        ).distinct()

        # 最大10件のみ返す
        return queryset[:10]  # .only() を削除

class UserDetailAPIView(RetrieveAPIView):
    """
    特定のユーザーの詳細を取得するAPI
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]  # 認証が必要
    lookup_field = 'id'  # URLでユーザーIDを指定

class MessageListAPIView(ListAPIView):
    """ログインユーザーと特定の相手とのメッセージ履歴を取得"""
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        receiver_id = self.request.query_params.get('receiver')
        if not receiver_id:
            return Message.objects.none()  # receiverが指定されていない場合は空リストを返す
        
        return Message.objects.filter(
            (Q(sender=self.request.user) & Q(receiver_id=receiver_id)) |
            (Q(sender_id=receiver_id) & Q(receiver=self.request.user))
        ).order_by('timestamp')

class SendMessageAPIView(generics.CreateAPIView):
    """新しいメッセージを送信する"""
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # sender をリクエストユーザーとして明示的に設定
        serializer.save(sender=self.request.user)

class MarkMessageAsReadAPIView(APIView):
    """特定のメッセージを既読にする"""
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id, receiver=request.user)
            message.is_read = True
            message.save(update_fields=['is_read'])
            return Response({"detail": "Message marked as read."}, status=200)
        except Message.DoesNotExist:
            return Response({"error": "Message not found."}, status=404)

class ConversationListAPIView(APIView):
    """
    ログインユーザーが関与するすべての会話を取得し、最新のメッセージを返す
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # ログインユーザーが関与するすべてのメッセージを取得
        messages = Message.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('timestamp')

        # 相手ごとに最新のメッセージを取得
        conversation_dict = defaultdict(lambda: {"message": None, "timestamp": None})

        for message in messages:
            # 相手のIDを取得
            other_user_id = message.receiver.id if message.sender == user else message.sender.id
            if (
                conversation_dict[other_user_id]["timestamp"] is None
                or conversation_dict[other_user_id]["timestamp"] < message.timestamp
            ):
                conversation_dict[other_user_id] = {
                    "message": message,
                    "timestamp": message.timestamp
                }

        # 会話リストを作成
        conversations = []
        for other_user_id, data in conversation_dict.items():
            other_user = CustomUser.objects.get(id=other_user_id)
            last_message = data["message"]

            # シリアライザーを使用してデータを整形
            serializer = ConversationSerializer(
                {
                    "other_user": other_user,
                    "last_message": last_message
                },
                context={"request": request}  # contextにrequestを渡す
            )
            conversations.append(serializer.data)

        return Response(conversations)

class UserProfileUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
            print("Starting update process...")  # 処理開始の確認

            data = request.data.copy()
            print("Original request data:", data)  # リクエストデータの確認

            if 'profile_image' in data and data.get('profile_image'):
                print("Profile image detected. Uploading to Cloudinary...")
                uploaded_file = upload(data['profile_image'], folder="profile_images")
                print("Uploaded file data:", uploaded_file)  # アップロード結果の確認
                data['profile_image'] = uploaded_file['secure_url']
                print("Updated profile_image URL:", data['profile_image'])  # 更新されたURLの確認
            else:
                print("No profile_image provided or empty. Skipping image update.")
                data.pop('profile_image', None)

            serializer = self.get_serializer(
                self.get_object(),
                data=data,
                partial=True,
                context={'request': request}
            )
            print("Serializer initialized with data:", serializer.initial_data)  # シリアライザの初期データ確認

            if not serializer.is_valid():
                print("Validation errors:", serializer.errors)  # バリデーションエラーの確認
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            print("Serializer data is valid. Performing update...")
            self.perform_update(serializer)
            print("Update performed successfully.")

            # 更新後のインスタンスを再取得してレスポンスを作成
            self.get_object().refresh_from_db()
            print("Object refreshed from DB.")

            serializer = self.get_serializer(self.get_object())
            print("Final serialized data:", serializer.data)  # 最終レスポンスデータの確認

            response = Response(serializer.data, status=status.HTTP_200_OK)
            response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            print("Response prepared with Cache-Control headers.")
            return response
