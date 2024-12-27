from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import CustomUser, Notification
from django.core.files.uploadedfile import SimpleUploadedFile
import os
from unittest.mock import patch

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
            'profile_image': ''
        }
        response = self.client.patch(url, data, format='json', partial=True)
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
        """user_type が読み取り専用であることを確認するテスト"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {
            'user_type': 'invalid-type'  # 無効なユーザータイプを渡す
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # 成功する
        self.user.refresh_from_db()
        self.assertEqual(self.user.user_type, 'student')  # 変更されていないことを確認

    def test_user_profile_update_duplicate_email(self):
        """既に存在するメールアドレスを使用して更新しようとした場合のバリデーションテスト"""
        CustomUser.objects.create_user(email='existinguser@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {
            'email': 'existinguser@example.com'
        }
        response = self.client.put(url, data, format='json', partial=True)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_user_profile_partial_update_successful(self):
        """部分更新 (PATCH) が成功するかをテスト"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        data = {
            'name': 'Partially Updated Name'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, 'Partially Updated Name')

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

    def test_user_profile_update_profile_image_successful(self):
        """プロフィール画像の更新が成功するかをテスト"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-update')
        
        image_path = os.path.join(os.path.dirname(__file__), 'test_image.png')
        
        with open(image_path, 'rb') as image_file:
            image = SimpleUploadedFile(
                name='new_image.png',
                content=image_file.read(),
                content_type='image/png'
            )

            data = {'profile_image': image}
            response = self.client.patch(url, data, format='multipart')

            if response.status_code != status.HTTP_200_OK:
                print("Response data:", response.data)

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.user.refresh_from_db()

            # startswithを使ってファイル名を確認
            self.assertTrue(self.user.profile_image.name.startswith('profile_images/new_image'))

class ChangePasswordAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(email='testuser@example.com', password='testpassword')
        self.client.force_authenticate(user=self.user)
        self.url = reverse('change-password')

    def test_change_password_successful(self):
        """パスワード変更が正常に行われるかをテスト"""
        data = {
            'current_password': 'testpassword',
            'new_password': 'newtestpassword',
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newtestpassword'))

    def test_change_password_with_incorrect_current_password(self):
        """現在のパスワードが間違っている場合のエラーテスト"""
        data = {
            'current_password': 'wrongpassword',
            'new_password': 'newtestpassword',
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('current_password', response.data)

    def test_change_password_with_same_password(self):
        """新しいパスワードが現在のパスワードと同じ場合のエラーテスト"""
        data = {
            'current_password': 'testpassword',
            'new_password': 'testpassword',
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

class NotificationListAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='testuser@example.com',
            password='testpassword'
        )
        self.url = reverse('notification-list')  # `notification-list` のエンドポイント

        # テスト用の通知を作成
        self.notification1 = Notification.objects.create(
            user=self.user,
            title="Notification 1",
            message="This is the first notification.",
            is_read=False
        )
        self.notification2 = Notification.objects.create(
            user=self.user,
            title="Notification 2",
            message="This is the second notification.",
            is_read=True  # 既読
        )

    def test_notification_list_authenticated_user(self):
        """認証済みユーザーが通知を正常に取得できるかをテスト"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 通知が2件返されることを確認
        self.assertEqual(len(response.data), 2)

        # 通知が降順で並んでいることを確認
        notifications = response.data
        self.assertGreaterEqual(
            notifications[0]['created_at'], notifications[1]['created_at']
        )

        # レスポンスデータの内容を検証
        expected_titles = [self.notification1.title, self.notification2.title]
        actual_titles = [notification['title'] for notification in notifications]
        self.assertEqual(set(expected_titles), set(actual_titles))

    def test_notification_list_order(self):
        """通知が作成日の降順で返されることをテスト"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)

        # 通知が降順で返されることを確認
        notifications = response.data
        self.assertGreaterEqual(
            notifications[0]['created_at'], notifications[1]['created_at']
        )

class AdminBulkNotificationAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()

        # 管理者ユーザーを作成
        self.admin_user = CustomUser.objects.create_superuser(
            email="admin@example.com",
            password="adminpassword"
        )

        # 一般ユーザーを作成
        self.user1 = CustomUser.objects.create_user(
            email="user1@example.com",
            password="user1password"
        )
        self.user2 = CustomUser.objects.create_user(
            email="user2@example.com",
            password="user2password"
        )

        # エンドポイントのURL
        self.url = reverse('admin-bulk-notify')  # `admin-bulk-notify` はURLの名前

    @patch("accounts.views.generate_notification.delay")
    def test_bulk_notification_success(self, mock_generate_notification):
        """管理者が一括通知を正常に作成できることをテスト"""
        self.client.force_authenticate(user=self.admin_user)

        data = {
            "title": "Important Announcement",
            "message": "This is a test announcement for all users.",
            "link": "http://example.com",
            "user_ids": [self.user1.id, self.user2.id]  # 特定ユーザー
        }

        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # タスクが正常に呼び出されたことを確認
        mock_generate_notification.assert_called_once_with(
            event_type="important_announcement",
            title="Important Announcement",
            message="This is a test announcement for all users.",
            link="http://example.com",
            user_ids=[self.user1.id, self.user2.id]
        )

    @patch("accounts.views.generate_notification.delay")
    def test_bulk_notification_missing_title_or_message(self, mock_generate_notification):
        """タイトルやメッセージが不足している場合のエラーハンドリングをテスト"""
        self.client.force_authenticate(user=self.admin_user)

        # タイトルがない場合
        data_missing_title = {
            "message": "This is a test announcement.",
            "link": "http://example.com"
        }
        response = self.client.post(self.url, data_missing_title, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

        # メッセージがない場合
        data_missing_message = {
            "title": "Missing Message Test",
            "link": "http://example.com"
        }
        response = self.client.post(self.url, data_missing_message, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

        # タスクが呼び出されていないことを確認
        mock_generate_notification.assert_not_called()

    def test_bulk_notification_permission_denied(self):
        """管理者以外がエンドポイントにアクセスできないことをテスト"""
        self.client.force_authenticate(user=self.user1)  # 一般ユーザーで認証

        data = {
            "title": "Unauthorized Access Test",
            "message": "This test should fail.",
            "link": "http://example.com"
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_bulk_notification_unauthenticated(self):
        """未認証ユーザーがエンドポイントにアクセスできないことをテスト"""
        data = {
            "title": "Unauthenticated Access Test",
            "message": "This test should fail.",
            "link": "http://example.com"
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class MarkNotificationAsReadAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        # ユーザーと通知をセットアップ
        self.user = CustomUser.objects.create_user(
            email='testuser@example.com',
            password='testpassword'
        )
        self.notification = Notification.objects.create(
            user=self.user,
            title="Test Notification",
            message="This is a test notification.",
            is_read=False
        )
        self.url = reverse('notification-mark-as-read', kwargs={'notification_id': self.notification.id})

    def test_mark_notification_as_read_authenticated_user(self):
        """認証済みユーザーが通知を既読にできることをテスト"""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "Notification marked as read.")

        # 通知が既読に更新されていることを確認
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)

    def test_mark_notification_as_read_unauthenticated_user(self):
        """未認証ユーザーが通知を既読にできないことをテスト"""
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_mark_notification_as_read_nonexistent_notification(self):
        """存在しない通知にアクセスした場合のエラーハンドリングをテスト"""
        self.client.force_authenticate(user=self.user)
        invalid_url = reverse('notification-mark-as-read', kwargs={'notification_id': 9999})
        response = self.client.post(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "Notification not found.")

    def test_mark_notification_as_read_forbidden_user(self):
        """他のユーザーの通知を既読にできないことをテスト"""
        other_user = CustomUser.objects.create_user(
            email='otheruser@example.com',
            password='otherpassword'
        )
        self.client.force_authenticate(user=other_user)
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)  # 通知が見つからないと返される
