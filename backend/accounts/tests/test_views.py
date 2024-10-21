from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import CustomUser

class UserRegistrationAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_user_registration_successful(self):
        """ユーザーが正常に作成されることをテスト"""
        url = reverse('user-register')
        data = {
            'email': 'newuser@example.com',
            'password': 'newpassword',
            'user_type': 'student'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CustomUser.objects.count(), 1)
        self.assertEqual(CustomUser.objects.first().email, 'newuser@example.com')
        self.assertEqual(CustomUser.objects.first().profile_image.name, 'profile_images/default_profile.png')

    def test_user_registration_invalid_data(self):
        """無効なデータでのリクエストに対するバリデーションエラーチェック"""
        url = reverse('user-register')
        data = {
            'password': 'newpassword'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

class UserProfileUpdateAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(email='testuser@example.com', password='testpassword')

    def test_user_profile_update_successful(self):
        """認証済みユーザーによるプロフィールの更新が成功するかをテスト"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {
            'email': 'updateduser@example.com',
            'user_type': 'teacher'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'updateduser@example.com')
        self.assertEqual(self.user.user_type, 'teacher')

    def test_user_profile_update_with_empty_profile_image(self):
        """プロフィール画像を空にした場合、デフォルト画像に置き換わることをテスト"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {
            'profile_image': ''
        }
        response = self.client.put(url, data, format='json', partial=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.profile_image.name, 'profile_images/default_profile.png')

    def test_user_profile_update_unauthenticated(self):
        """未認証ユーザーによるアクセスが拒否されるかをテスト"""
        url = reverse('user-profile-update')
        data = {
            'email': 'updateduser@example.com',
        }
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_profile_update_invalid_email(self):
        """無効なメールアドレスを渡した場合のバリデーションテスト"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {
            'email': 'invalid-email'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_user_profile_update_invalid_user_type(self):
        """無効なユーザータイプを渡した場合のバリデーションテスト"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {
            'user_type': 'invalid-type'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('user_type', response.data)

class UserProfileUpdateAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(email='testuser@example.com', password='testpassword')

    def test_user_profile_update_name_successful(self):
        """認証済みユーザーによる名前の更新が成功するかをテスト"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {
            'name': 'Updated Name'
        }
        response = self.client.put(url, data, format='json', partial=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, 'Updated Name')

    def test_user_profile_update_invalid_name(self):
        """無効な名前を渡した場合のバリデーションエラーチェック"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {
            'name': ''  # 空の名前は無効
        }
        response = self.client.put(url, data, format='json', partial=True)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)