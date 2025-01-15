from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from accounts.models import CustomUser, Notification, Message
from django.core.files.uploadedfile import SimpleUploadedFile
from datetime import datetime, timezone
import os
from unittest.mock import patch
from django.db.models import Q  # 修正: Q をインポート
from django.conf import settings
from django.test import override_settings

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

class UserDetailAPITestCase(APITestCase):
    def setUp(self):
        # テスト用のユーザー作成
        self.user = CustomUser.objects.create_user(
            email='testuser@example.com',
            password='testpassword',
            name='Test User',
            user_type='student'
        )
        self.client.force_authenticate(user=self.user)

    def test_get_user_detail(self):
        # ユーザー詳細取得APIのテスト
        response = self.client.get(f'/accounts/users/{self.user.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)
        self.assertEqual(response.data['name'], self.user.name)
        self.assertEqual(response.data['user_type'], self.user.user_type)

    def test_get_user_detail_unauthenticated(self):
        # 未認証のリクエストをテスト
        self.client.logout()
        response = self.client.get(f'/accounts/users/{self.user.id}/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class MessageAPIViewTestCase(TestCase):
    def setUp(self):
        # テスト用ユーザー作成
        self.sender = CustomUser.objects.create_user(
            email='sender@example.com',
            password='password123',
            user_type='student'
        )
        self.receiver = CustomUser.objects.create_user(
            email='receiver@example.com',
            password='password456',
            user_type='student'
        )
        # テスト用メッセージ作成
        self.message1 = Message.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            content="Test message 1"
        )
        self.message2 = Message.objects.create(
            sender=self.receiver,
            receiver=self.sender,
            content="Test message 2",
            is_read=True
        )
        self.client = APIClient()
        self.url_list = reverse('message-list')  # メッセージ履歴取得URL
        self.url_send = reverse('message-send')  # メッセージ送信URL
        self.mark_as_read_url = lambda message_id: reverse('message-mark-as-read', args=[message_id])

    def test_get_message_list(self):
        """メッセージ履歴取得が正常に動作するかをテスト"""
        self.client.force_authenticate(user=self.sender)
        response = self.client.get(self.url_list, {'receiver': self.receiver.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # 送信・受信の両方のメッセージが取得される
        self.assertEqual(response.data[0]['content'], "Test message 1")
        self.assertEqual(response.data[1]['content'], "Test message 2")

    def test_get_message_list_unauthenticated(self):
        """未認証状態でのメッセージ履歴取得が拒否されることをテスト"""
        response = self.client.get(self.url_list, {'receiver': self.receiver.id})
        print("Unauthenticated Response Status Code:", response.status_code)  # デバッグ用
        print("Unauthenticated Response Data:", response.data)  # デバッグ用
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_send_message(self):
        """新しいメッセージを送信するテスト"""
        self.client.force_authenticate(user=self.sender)  # 認証済みの sender
        data = {
            'receiver': self.receiver.id,
            'content': "New test message"
        }
        response = self.client.post(self.url_send, data)
        print("Response status code:", response.status_code)  # デバッグ用
        print("Response data:", response.data)  # デバッグ用
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], "New test message")
        self.assertEqual(response.data['sender'], self.sender.id)
        self.assertEqual(response.data['receiver'], self.receiver.id)
        self.assertFalse(response.data['is_read'])  # 新しいメッセージは未読であることを確認

    def test_send_message_unauthenticated(self):
        """未認証状態でのメッセージ送信が拒否されることをテスト"""
        data = {
            'receiver': self.receiver.id,
            'content': "Unauthenticated test message"
        }
        response = self.client.post(self.url_send, data)
        print("Unauthenticated Response Status Code:", response.status_code)  # デバッグ用
        print("Unauthenticated Response Data:", response.data)  # デバッグ用
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_mark_message_as_read(self):
        """特定のメッセージを既読にするテスト"""
        self.client.force_authenticate(user=self.receiver)  # メッセージの受信者で認証
        response = self.client.post(self.mark_as_read_url(self.message1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.message1.refresh_from_db()
        self.assertTrue(self.message1.is_read)  # メッセージが既読になったことを確認

    def test_mark_message_as_read_unauthenticated(self):
        """未認証状態での既読操作が拒否されることをテスト"""
        response = self.client.post(self.mark_as_read_url(self.message1.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_mark_message_as_read_invalid_message(self):
        """他のユーザーのメッセージを既読にしようとするとエラーになることをテスト"""
        self.client.force_authenticate(user=self.sender)  # 送信者で認証
        response = self.client.post(self.mark_as_read_url(self.message1.id))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)  # 他人のメッセージは見つからない扱い

class ConversationListAPIViewTestCase(TestCase):
    def setUp(self):
        # テスト用ユーザー作成
        self.user1 = CustomUser.objects.create_user(
            email="user1@example.com",
            password="password1",
            name="User 1"
        )
        self.user2 = CustomUser.objects.create_user(
            email="user2@example.com",
            password="password2",
            name="User 2"
        )
        self.user3 = CustomUser.objects.create_user(
            email="user3@example.com",
            password="password3",
            name="User 3"
        )

        # テスト用メッセージ作成
        self.message1 = Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            content="Message from User 1 to User 2",
        )
        self.message2 = Message.objects.create(
            sender=self.user2,
            receiver=self.user1,
            content="Reply from User 2 to User 1",
        )
        self.message3 = Message.objects.create(
            sender=self.user1,
            receiver=self.user3,
            content="Message from User 1 to User 3",
        )

        self.client = APIClient()
        self.url = reverse("conversation-list")

    def test_get_conversations_authenticated(self):
        """認証済みユーザーが会話リストを取得できることをテスト"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 会話が2つ存在することを確認
        self.assertEqual(len(response.data), 2)

        # User 2との会話
        conversation_with_user2 = next(
            conv for conv in response.data if conv["other_user"]["id"] == self.user2.id
        )
        self.assertEqual(conversation_with_user2["last_message"]["content"], "Reply from User 2 to User 1")
        self.assertEqual(conversation_with_user2["last_message"]["id"], self.message2.id)  # メッセージIDで確認
        self.assertEqual(conversation_with_user2["other_user"]["name"], "User 2")
        self.assertEqual(conversation_with_user2["other_user"]["profile_image"], "/media/profile_images/default_profile.png")

        # User 3との会話
        conversation_with_user3 = next(
            conv for conv in response.data if conv["other_user"]["id"] == self.user3.id
        )
        self.assertEqual(conversation_with_user3["last_message"]["content"], "Message from User 1 to User 3")
        self.assertEqual(conversation_with_user3["last_message"]["id"], self.message3.id)  # メッセージIDで確認
        self.assertEqual(conversation_with_user3["other_user"]["name"], "User 3")
        self.assertEqual(conversation_with_user3["other_user"]["profile_image"], "/media/profile_images/default_profile.png")

    def test_get_conversations_unauthenticated(self):
        """未認証ユーザーが会話リストを取得できないことをテスト"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class UserProfileUpdateAPIViewTest(TestCase):
    def setUp(self):
        # テストユーザー作成
        self.user = CustomUser.objects.create_user(
            email='testuser@example.com',
            password='testpassword',
            name='Test User'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.url = reverse('user-profile-update')  # 適切なエンドポイント名を使用してください

    @patch('cloudinary.uploader.upload')
    @override_settings(DEFAULT_FILE_STORAGE='cloudinary_storage.storage.MediaCloudinaryStorage')
    def test_update_profile_with_image(self, mock_upload):
        """プロフィール画像をアップロードした場合のテスト"""
        if settings.DEBUG:
            expected_url_prefix = settings.MEDIA_URL
        else:
            expected_url_prefix = 'https://res.cloudinary.com/'

        # Cloudinaryアップロードのモック
        mock_upload.return_value = {'secure_url': 'https://res.cloudinary.com/test/image/upload/v12345/test_image.jpg'}

        # 正しい絶対パスの構築
        test_image_path = os.path.join(settings.BASE_DIR, 'media/profile_images/default_profile.png')
        with open(test_image_path, 'rb') as img:
            test_image = SimpleUploadedFile(
                name='test_image.png',
                content=img.read(),
                content_type='image/png'
            )

        data = {'profile_image': test_image}
        response = self.client.patch(self.url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()

        # デバッグ出力
        print(f"Expected URL prefix: {expected_url_prefix}")
        print(f"Actual profile image URL: {self.user.profile_image.url}")

        # プロフィール画像のURLが正しいプレフィックスで始まるか確認
        self.assertTrue(self.user.profile_image.url.startswith(expected_url_prefix))
    
    def test_update_without_profile_image(self):
        """プロフィール画像を送信しない場合、既存の画像が保持されることを確認"""
        # プロフィール画像を既存の画像に設定
        self.user.profile_image = 'https://res.cloudinary.com/test/image/upload/v12345/existing_image.jpg'
        self.user.save()

        # 名前の更新データ
        data = {'name': 'Updated Name'}
        response = self.client.patch(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()

        # 名前が更新されていることを確認
        self.assertEqual(self.user.name, 'Updated Name')
        # プロフィール画像は変更されていないことを確認
        self.assertEqual(
            self.user.profile_image,
            'https://res.cloudinary.com/test/image/upload/v12345/existing_image.jpg'
        )
    
    def test_update_unauthenticated(self):
        """未認証状態での更新が拒否されることを確認"""
        self.client.logout()  # 認証解除

        # 名前の更新データ
        data = {'name': 'Unauthorized Update'}
        response = self.client.patch(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
