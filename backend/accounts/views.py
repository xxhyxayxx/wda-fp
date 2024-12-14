from rest_framework import generics, permissions
from .models import CustomUser, Notification
from .serializers import UserRegistrationSerializer, UserProfileSerializer, ChangePasswordSerializer, NotificationSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.generics import ListAPIView


class UserRegistrationAPIView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        # リクエストデータをコピーし、画像が空の場合の処理を変更
        data = request.data.copy()

        # 画像が送信されなかった場合には、profile_image をそのままにする
        if 'profile_image' not in data or data.get('profile_image') == '':
            data.pop('profile_image', None)  # profile_imageを削除して変更しない

        serializer = self.get_serializer(self.get_object(), data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

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