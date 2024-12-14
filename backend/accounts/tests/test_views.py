from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import CustomUser, Notification
from django.core.files.uploadedfile import SimpleUploadedFile
import os

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
            link="http://example.com/1"
        )
        self.notification2 = Notification.objects.create(
            user=self.user,
            title="Notification 2",
            message="This is the second notification.",
            link="http://example.com/2"
        )

        # 別のユーザーの通知
        self.other_user = CustomUser.objects.create_user(
            email='otheruser@example.com',
            password='otherpassword'
        )
        Notification.objects.create(
            user=self.other_user,
            title="Other User Notification",
            message="This should not be visible to the first user.",
            link="http://example.com/other"
        )

    def test_notification_list_authenticated_user(self):
        """認証済みユーザーが通知を正常に取得できるかをテスト"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 通知が2件のみ返されることを確認
        self.assertEqual(len(response.data), 2)

        # レスポンスデータの内容を検証
        expected_titles = ["Notification 1", "Notification 2"]
        actual_titles = [notification['title'] for notification in response.data]
        self.assertEqual(set(actual_titles), set(expected_titles))

    def test_notification_list_unauthenticated_user(self):
        """未認証ユーザーが通知一覧を取得できないことをテスト"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_notification_order(self):
        """通知が作成日の降順で返されることをテスト"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)

        # レスポンスデータが降順で並んでいることを確認
        notifications = response.data
        self.assertGreaterEqual(
            notifications[0]['created_at'], notifications[1]['created_at']
        )