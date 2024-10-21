from django.test import TestCase
from accounts.models import CustomUser
from accounts.serializers import UserRegistrationSerializer, UserProfileSerializer

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

from django.test import RequestFactory

class UserProfileSerializerTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = CustomUser.objects.create_user(
            email='testuser@example.com',
            password='testpassword',
            user_type='student',
            name='Test User'
        )
    
    def test_profile_serializer_valid_data(self):
        """シリアライザが有効なデータを処理できるかをテスト"""
        data = {
            'email': 'updateduser@example.com',
            'name': 'Updated Name',
            'user_type': 'teacher',
        }
        request = self.factory.get('/profile/update/')
        request.user = self.user
        serializer = UserProfileSerializer(instance=self.user, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid())
        updated_user = serializer.save()
        self.assertEqual(updated_user.email, data['email'])
        self.assertEqual(updated_user.name, data['name'])
        self.assertEqual(updated_user.user_type, data['user_type'])

    def test_profile_serializer_email_unique(self):
        """メールアドレスが一意であることを確認するテスト"""
        CustomUser.objects.create_user(
            email='anotheruser@example.com',
            password='anotherpassword'
        )
        data = {
            'email': 'anotheruser@example.com',  # 既存のメールアドレス
        }
        request = self.factory.get('/profile/update/')
        request.user = self.user
        serializer = UserProfileSerializer(instance=self.user, data=data, partial=True, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_profile_serializer_partial_update(self):
        """シリアライザが部分更新を正しく処理できるかをテスト"""
        data = {
            'name': 'Partially Updated Name',
        }
        request = self.factory.get('/profile/update/')
        request.user = self.user
        serializer = UserProfileSerializer(instance=self.user, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid())
        updated_user = serializer.save()
        self.assertEqual(updated_user.name, data['name'])
        self.assertEqual(updated_user.email, self.user.email)  # 他のフィールドは変更されないことを確認

    def test_default_profile_image_remains(self):
        """profile_image が指定されていない場合、デフォルトの画像が維持されることを確認するテスト"""
        data = {
            'name': 'Updated Name Without Image',
        }
        request = self.factory.get('/profile/update/')
        request.user = self.user
        serializer = UserProfileSerializer(instance=self.user, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid())
        updated_user = serializer.save()
        self.assertEqual(updated_user.profile_image.name, 'profile_images/default_profile.png')
