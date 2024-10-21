from django.test import TestCase
from accounts.models import CustomUser
from accounts.serializers import UserRegistrationSerializer

class UserRegistrationSerializerTest(TestCase):
    def test_user_registration_serializer_with_valid_data(self):
        """シリアライザが有効なデータを処理できるかをテスト"""
        data = {
            'email': 'testuser@example.com',
            'password': 'testpassword',
            'user_type': 'student'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.email, data['email'])
        self.assertTrue(user.check_password(data['password']))
        self.assertEqual(user.user_type, data['user_type'])

    def test_password_write_only(self):
        """パスワードフィールドが書き込み専用であることを確認するテスト"""
        data = {
            'email': 'testuser@example.com',
            'password': 'testpassword',
            'user_type': 'student'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        serialized_data = serializer.data
        self.assertNotIn('password', serialized_data)

    def test_user_registration_serializer_with_invalid_data(self):
        """無効なデータを渡した場合のバリデーションテスト"""
        data = {
            'password': 'testpassword',
            'user_type': 'student'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_default_profile_image_used(self):
        """profile_image が指定されていない場合、デフォルトの画像が使用されることを確認するテスト"""
        data = {
            'email': 'testuser@example.com',
            'password': 'testpassword',
            'user_type': 'student'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.profile_image.name, 'profile_images/default_profile.png')

    def test_user_registration_serializer_with_invalid_email(self):
        """無効なメールアドレスが渡された場合のバリデーションテスト"""
        data = {
            'email': 'invalid-email',
            'password': 'testpassword',
            'user_type': 'student'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_password_is_required(self):
        """パスワードが必須であることのバリデーションテスト"""
        data = {
            'email': 'testuser@example.com',
            'user_type': 'student'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_default_name_value(self):
        """ユーザー作成時のデフォルトの名前が 'New User' であることをテスト"""
        data = {
            'email': 'testuser@example.com',
            'password': 'testpassword',
            'user_type': 'student'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.name, 'New User')

    def test_name_can_be_specified_during_registration(self):
        """登録時に名前を指定できるかのテスト"""
        data = {
            'email': 'testuser@example.com',
            'password': 'testpassword',
            'user_type': 'student',
            'name': 'Test User'
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.name, 'Test User')
