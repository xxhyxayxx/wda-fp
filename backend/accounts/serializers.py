from rest_framework import serializers
from .models import CustomUser

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
    profile_image = serializers.ImageField(allow_null=True, required=False)  # allow_nullとrequired=Falseを追加

    class Meta:
        model = CustomUser
        fields = ('email', 'name', 'user_type', 'profile_image')

    def validate(self, data):
        # プロフィール画像が空の場合はデフォルトに設定
        if 'profile_image' in data and not data['profile_image']:
            data['profile_image'] = 'profile_images/default_profile.png'
        return data