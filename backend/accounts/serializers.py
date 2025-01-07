from rest_framework import serializers
from .models import CustomUser, Notification, Message

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('email', 'password', 'user_type', 'name')  # nameフィールドを追加

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            user_type=validated_data.get('user_type', 'student'),
            name=validated_data.get('name', 'New User')  # nameフィールドを追加、デフォルト値設定
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(allow_null=True, required=False)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'name', 'user_type', 'profile_image')  # 'id' を追加
        read_only_fields = ('user_type',)  # user_typeを読み取り専用に設定

    def validate(self, data):
        if 'profile_image' in data and not data['profile_image']:
            data['profile_image'] = 'profile_images/default_profile.png'
        return data

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, data):
        if data['current_password'] == data['new_password']:
            raise serializers.ValidationError("New password must be different from the current password.")
        return data

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])  # パスワードのみを保存

class NotificationSerializer(serializers.ModelSerializer):
    """Notification モデルのシリアライザー"""
    class Meta:
        model = Notification
        fields = ('id', 'user', 'title', 'message', 'link', 'event_type', 'created_at', 'is_read')
        read_only_fields = ('id', 'user', 'created_at')  # is_read を書き込み可能にしない場合はここに追加

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'sender', 'receiver', 'content', 'timestamp', 'is_read')
        read_only_fields = ('id', 'timestamp', 'sender')  # senderは自動的に設定

    def validate(self, data):
        # リクエストユーザーをsenderとして設定
        sender = self.context['request'].user
        receiver = data.get('receiver')

        # senderとreceiverが異なる必要がある
        if sender == receiver:
            raise serializers.ValidationError({"receiver": "Sender and receiver must be different."})

        # senderをデータに追加
        data['sender'] = sender
        return data



