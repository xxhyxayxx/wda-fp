from django.test import TestCase
from accounts.models import CustomUser, Notification, Message
from accounts.serializers import UserRegistrationSerializer, UserProfileSerializer, ChangePasswordSerializer, NotificationSerializer, MessageSerializer
from django.test import RequestFactory
from rest_framework import serializers
from dateutil.parser import isoparse
from rest_framework.test import APIRequestFactory

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
        """シリアライザが有効なデータを正しく処理できるかをテスト"""
        data = {
            'email': 'updateduser@example.com',
            'name': 'Updated Name',
        }
        request = self.factory.get('/profile/update/')
        request.user = self.user
        serializer = UserProfileSerializer(instance=self.user, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid())
        updated_user = serializer.save()
        self.assertEqual(updated_user.email, data['email'])
        self.assertEqual(updated_user.name, data['name'])

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
    
    def test_profile_serializer_user_type_read_only(self):
        """user_typeが読み取り専用であることをテスト"""
        data = {
            'user_type': 'teacher',  # user_typeの変更を試みる
        }
        request = self.factory.get('/profile/update/')
        request.user = self.user
        serializer = UserProfileSerializer(instance=self.user, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid())  # シリアライザ自体は有効
        updated_user = serializer.save()
        self.assertEqual(updated_user.user_type, 'student')  # user_typeは変更されていないことを確認

class ChangePasswordSerializerTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='testuser@example.com',
            password='testpassword',
            user_type='student'
        )
        self.factory = RequestFactory()

    def test_change_password_with_valid_data(self):
        """正しいデータでパスワードが正常に変更されるかをテスト"""
        data = {
            'current_password': 'testpassword',
            'new_password': 'newtestpassword',
        }
        request = self.factory.post('/change-password/')
        request.user = self.user
        serializer = ChangePasswordSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid())
        serializer.save()
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newtestpassword'))

    def test_change_password_with_incorrect_current_password(self):
        """現在のパスワードが間違っている場合にエラーが返されるかをテスト"""
        data = {
            'current_password': 'wrongpassword',
            'new_password': 'newtestpassword',
        }
        request = self.factory.post('/change-password/')
        request.user = self.user
        serializer = ChangePasswordSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('current_password', serializer.errors)

    def test_change_password_with_same_password(self):
        """新しいパスワードが現在のパスワードと同じ場合にエラーが返されるかをテスト"""
        data = {
            'current_password': 'testpassword',
            'new_password': 'testpassword',
        }
        request = self.factory.post('/change-password/')
        request.user = self.user
        serializer = ChangePasswordSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

class NotificationSerializerTest(TestCase):
    def setUp(self):
        # テスト用のユーザーを作成
        self.user = CustomUser.objects.create_user(
            email='testuser@example.com',
            password='testpassword',
            user_type='student',
            name='Test User'
        )
        # テスト用の通知データを準備
        self.notification = Notification.objects.create(
            user=self.user,
            title="Test Notification",
            message="This is a test notification.",
            link="http://example.com/test"
        )

    def test_notification_serializer_with_valid_data(self):
        """NotificationSerializer が有効なデータを正しくシリアライズするかをテスト"""
        serializer = NotificationSerializer(instance=self.notification)
        
        serialized_data = serializer.data
        expected_data = {
            'id': self.notification.id,
            'user': self.user.id,  # ForeignKey の ID
            'title': self.notification.title,
            'message': self.notification.message,
            'link': self.notification.link,
            'event_type': self.notification.event_type,  # event_type フィールドは残す
            'is_read': self.notification.is_read,  # is_read フィールドを追加
            'created_at': self.notification.created_at.isoformat(),  # ISOフォーマットで比較
        }

        # 比較: created_at
        self.assertEqual(
            isoparse(serialized_data['created_at']),
            isoparse(expected_data['created_at'])
        )

        # created_at 以外のフィールド比較
        del serialized_data['created_at']
        del expected_data['created_at']
        self.assertEqual(serialized_data, expected_data)

    def test_notification_serializer_default_is_read(self):
        """is_read フィールドのデフォルト値が False であることをテスト"""
        serializer = NotificationSerializer(instance=self.notification)
        self.assertFalse(serializer.data['is_read'])  # デフォルト値の確認

    def test_notification_serializer_with_is_read_update(self):
        """is_read フィールドが正しく更新されるかをテスト"""
        data = {
            'is_read': True
        }
        serializer = NotificationSerializer(instance=self.notification, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_notification = serializer.save()
        self.assertTrue(updated_notification.is_read)  # is_read が更新されていることを確認

    def test_notification_serializer_excludes_read_only_fields(self):
        """読み取り専用フィールドが入力データとして受け入れられないことを確認するテスト"""
        data = {
            'id': 999,  # 読み取り専用フィールドを設定
            'user': self.user.id,
            'title': "Invalid Notification",
            'message': "This notification should not allow id to be set.",
            'link': "http://example.com",
            'is_read': False  # 書き込み可能な is_read
        }
        serializer = NotificationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        notification = serializer.save(user=self.user)  # user を渡す
        self.assertNotEqual(notification.id, 999)  # id はデータベースで自動設定される
        self.assertIsNotNone(notification.created_at)  # created_at も自動設定
        self.assertFalse(notification.is_read)  # is_read が正しく設定されることを確認

    def test_notification_serializer_partial_update(self):
        """部分更新で is_read フィールドを変更できることをテスト"""
        data = {
            'is_read': True
        }
        serializer = NotificationSerializer(instance=self.notification, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_notification = serializer.save()
        self.assertTrue(updated_notification.is_read)  # 部分更新で is_read が変更されていることを確認

class MessageSerializerTest(TestCase):
    def setUp(self):
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
        self.message = Message.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            content="Test message content"
        )
        self.assertFalse(self.message.is_read)  # デフォルト値確認

    def test_message_serializer_with_valid_data(self):
        serializer = MessageSerializer(instance=self.message)
        
        # 各フィールドを個別に比較
        self.assertEqual(serializer.data['id'], self.message.id)
        self.assertEqual(serializer.data['sender'], self.sender.id)
        self.assertEqual(serializer.data['receiver'], self.receiver.id)
        self.assertEqual(serializer.data['content'], self.message.content)
        
        # タイムゾーンを正規化してtimestampを比較
        serialized_timestamp = isoparse(serializer.data['timestamp'])
        expected_timestamp = isoparse(self.message.timestamp.isoformat())
        self.assertEqual(serialized_timestamp, expected_timestamp)

        self.assertEqual(serializer.data['is_read'], self.message.is_read)

    def test_message_serializer_excludes_read_only_fields(self):
        data = {
            'id': 999,
            'timestamp': '2025-01-01T00:00:00Z',
            'is_read': True,  # 入力データとして渡されるが無視されるべき
            'sender': self.sender.id,
            'receiver': self.receiver.id,
            'content': "This is a test message"
        }
        serializer = MessageSerializer(data=data, context={'request': self.request})
        self.assertTrue(serializer.is_valid())

        # `is_read` を明示的に設定する場合
        message = serializer.save(sender=self.sender, is_read=False)
        
        self.assertNotEqual(message.id, 999)  # id は自動的に設定されるべき
        self.assertFalse(message.is_read)  # is_read は明示的に False に設定されていることを確認


    def test_message_serializer_partial_update(self):
        data = {'is_read': True}
        serializer = MessageSerializer(instance=self.message, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_message = serializer.save()
        self.assertTrue(updated_message.is_read)

    def test_message_serializer_validates_sender_and_receiver_are_different(self):
        data = {
            'sender': self.sender.id,
            'receiver': self.sender.id,
            'content': "This message has the same sender and receiver"
        }
        serializer = MessageSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('receiver', serializer.errors)

class MessageSerializerTest(TestCase):
    def setUp(self):
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
        self.message = Message.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            content="Test message content"
        )
        self.factory = APIRequestFactory()
        self.request = self.factory.post('/messages/', {}, format='json')
        self.request.user = self.sender

    def test_message_serializer_with_valid_data(self):
        serializer = MessageSerializer(instance=self.message, context={'request': self.request})
        
        self.assertEqual(serializer.data['id'], self.message.id)
        self.assertEqual(serializer.data['sender'], self.sender.id)
        self.assertEqual(serializer.data['receiver'], self.receiver.id)
        self.assertEqual(serializer.data['content'], self.message.content)
        
        serialized_timestamp = isoparse(serializer.data['timestamp'])
        expected_timestamp = isoparse(self.message.timestamp.isoformat())
        self.assertEqual(serialized_timestamp, expected_timestamp)
        self.assertEqual(serializer.data['is_read'], self.message.is_read)

    def test_message_serializer_excludes_read_only_fields(self):
        data = {
            'receiver': self.receiver.id,
            'content': "This is a test message"
        }
        serializer = MessageSerializer(data=data, context={'request': self.request})
        self.assertTrue(serializer.is_valid())
        message = serializer.save()
        self.assertEqual(message.sender, self.sender)  # senderがリクエストユーザーに設定されていることを確認
        self.assertEqual(message.receiver, self.receiver)
        self.assertFalse(message.is_read)

    def test_message_serializer_partial_update(self):
        data = {'is_read': True}
        serializer = MessageSerializer(instance=self.message, data=data, partial=True, context={'request': self.request})
        self.assertTrue(serializer.is_valid())
        updated_message = serializer.save()
        self.assertTrue(updated_message.is_read)

    def test_message_serializer_validates_sender_and_receiver_are_different(self):
        data = {
            'sender': self.sender.id,
            'receiver': self.sender.id,
            'content': "This message has the same sender and receiver"
        }
        serializer = MessageSerializer(data=data, context={'request': self.request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('receiver', serializer.errors)
