from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import CustomUser, Notification
from django.core.files.uploadedfile import SimpleUploadedFile
from datetime import datetime
import os
from unittest.mock import patch
from django.db.models import Q  # 修正: Q をインポート

class UserRegistrationAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def tearDown(self):
        CustomUser.objects.all().delete()  # データを削除してリセット

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

    def tearDown(self):
        CustomUser.objects.all().delete()

    def test_user_profile_update_successful(self):
        """user_type が読み取り専用であり、変更されないことを確認"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {
            'email': 'updateduser@example.com',
            'user_type': 'teacher'  # 無効な変更
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'updateduser@example.com')
        self.assertEqual(self.user.user_type, 'student')  # 変更されないことを確認

    def test_user_profile_update_with_empty_profile_image(self):
        """プロフィール画像を空にした場合、デフォルト画像に置き換わることをテスト"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {
            'profile_image': None  # 空の画像フィールドを送信
        }
        response = self.client.patch(url, data, format='json', partial=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.profile_image.name, 'profile_images/default_profile.png')

    def test_user_profile_update_profile_image_successful(self):
        """プロフィール画像の更新が成功するかをテスト"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        image_path = os.path.join(os.path.dirname(__file__), 'test_image.png')
        if not os.path.exists(image_path):
            self.skipTest("テスト画像が存在しないため、このテストをスキップします。")
        with open(image_path, 'rb') as image_file:
            image = SimpleUploadedFile(
                name='new_image.png',
                content=image_file.read(),
                content_type='image/png'
            )
            data = {'profile_image': image}
            response = self.client.patch(url, data, format='multipart')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.user.refresh_from_db()
            self.assertTrue(self.user.profile_image.name.startswith('profile_images/new_image'))

    def test_user_profile_update_invalid_email(self):
        """無効なメールアドレスを渡した場合のバリデーションテスト"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {'email': 'invalid-email'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_user_profile_update_duplicate_email(self):
        """既存のメールアドレスでの更新が失敗することをテスト"""
        CustomUser.objects.create_user(email='existinguser@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {'email': 'existinguser@example.com'}
        response = self.client.put(url, data, format='json', partial=True)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

class NotificationListAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(email='testuser@example.com', password='testpassword')
        self.url = reverse('notification-list')
        self.notification1 = Notification.objects.create(
            user=self.user, title="Notification 1", message="First notification", is_read=False)
        self.notification2 = Notification.objects.create(
            user=self.user, title="Notification 2", message="Second notification", is_read=True)

    def tearDown(self):
        CustomUser.objects.all().delete()
        Notification.objects.all().delete()

    def test_notification_list_authenticated_user(self):
        """認証済みユーザーが通知を取得できることをテスト"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        created_at_list = [
            datetime.fromisoformat(notification['created_at'].replace('Z', '+00:00')) for notification in response.data
        ]
        self.assertTrue(all(created_at_list[i] >= created_at_list[i+1] for i in range(len(created_at_list) - 1)))

    def test_notification_list_unauthenticated_user(self):
        """未認証ユーザーが通知を取得できないことをテスト"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class UserSearchAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = CustomUser.objects.create_user(
            email="unique_user1@example.com",
            name="John Doe",
            password="password1"
        )
        self.user2 = CustomUser.objects.create_user(
            email="unique_user2@example.com",
            name="Jane Smith",
            password="password2"
        )
        self.user3 = CustomUser.objects.create_user(
            email="non_matching@example.com",
            name="Non Matching User",
            password="password3"
        )
        self.client.force_authenticate(user=self.user1)
        self.url = reverse('user-search')

    def tearDown(self):
        CustomUser.objects.all().delete()

    def test_user_search_by_name(self):
        """名前での部分一致検索が機能するかをテスト"""
        response = self.client.get(f'{self.url}?q=John')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "John Doe")

    def test_user_search_by_email(self):
        """メールアドレスでの部分一致検索が機能するかをテスト"""
        response = self.client.get(f'{self.url}?q=unique_user2@example.com')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['email'], "unique_user2@example.com")

    def test_user_search_no_results(self):
        """検索結果がゼロ件の場合をテスト"""
        response = self.client.get(f'{self.url}?q=nonexistent')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_user_search_case_insensitive(self):
        """大文字小文字を区別せずに検索が行われることをテスト"""
        response = self.client.get(f'{self.url}?q=john')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "John Doe")

    def test_user_search_limit_results(self):
        """検索結果が10件に制限されているかをテスト"""
        for i in range(11):
            CustomUser.objects.create_user(
                email=f"user{i+10}@example.com",
                name=f"User {i}",
                password=f"password{i}"
            )
        response = self.client.get(f'{self.url}?q=user')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 10)

    def test_user_search_partial_match(self):
        """部分一致検索が機能するかをテスト"""
        response = self.client.get(f'{self.url}?q=unique_user')
        print("Response data:", response.data)  # デバッグ用
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # 正確なデータ件数を確認
        emails = [user['email'] for user in response.data]
        self.assertIn("unique_user1@example.com", emails)
        self.assertIn("unique_user2@example.com", emails)