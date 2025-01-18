from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import Notification
from accounts.models import Message

CustomUser = get_user_model()

class CustomUserModelTest(TestCase):

    def setUp(self):
        self.user_data = {
            'email': 'testuser@example.com',
            'password': 'testpassword123',
            'user_type': 'student'
        }
        self.default_profile_image_url = (
            "https://res.cloudinary.com/dkmwoidaa/image/upload/v1736835004/"
            "profile_images/kaft7arwqbkxzdw2qerj.png"
        )

    def test_create_user_with_email_successful(self):
        """メールアドレスでユーザーが正常に作成されることをテスト"""
        user = CustomUser.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data['email'])
        self.assertTrue(user.check_password(self.user_data['password']))

    def test_create_user_without_email_raises_error(self):
        """メールアドレスがない場合にエラーが発生することをテスト"""
        with self.assertRaises(ValueError):
            CustomUser.objects.create_user(email=None, password='testpassword123')

    def test_create_superuser_successful(self):
        """スーパーユーザーが正常に作成されることをテスト"""
        superuser = CustomUser.objects.create_superuser(email='superuser@example.com', password='superpassword')
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)

    def test_email_is_unique(self):
        """メールアドレスがユニークであることをテスト"""
        CustomUser.objects.create_user(**self.user_data)
        with self.assertRaises(Exception):
            CustomUser.objects.create_user(**self.user_data)  # 同じメールアドレスで再作成しようとする

    def test_user_type_default_value(self):
        """ユーザータイプのデフォルト値が 'student' であることをテスト"""
        user = CustomUser.objects.create_user(email='defaultuser@example.com', password='defaultpassword')
        self.assertEqual(user.user_type, 'student')

    def test_default_profile_image(self):
        """プロフィール画像のデフォルト値が設定したURLであることをテスト"""
        user = CustomUser.objects.create_user(email='profileuser@example.com', password='profilepassword')
        self.assertEqual(user.profile_image, self.default_profile_image_url)

    def test_set_profile_image_url(self):
        """プロフィール画像にURLを設定できることをテスト"""
        user = CustomUser.objects.create_user(**self.user_data)
        user.profile_image = self.default_profile_image_url
        user.save()
        self.assertEqual(user.profile_image, self.default_profile_image_url)

    def test_user_str_method(self):
        """__str__ メソッドがメールアドレスを返すことをテスト"""
        user = CustomUser.objects.create_user(**self.user_data)
        self.assertEqual(str(user), self.user_data['email'])

    def test_update_user_type(self):
        """ユーザーの user_type を更新するテスト"""
        user = CustomUser.objects.create_user(**self.user_data)
        user.user_type = 'teacher'
        user.save()
        self.assertEqual(user.user_type, 'teacher')

    def test_delete_user(self):
        """ユーザーの削除が正常に行われることをテスト"""
        user = CustomUser.objects.create_user(**self.user_data)
        user_id = user.id
        user.delete()
        self.assertFalse(CustomUser.objects.filter(id=user_id).exists())

    def test_default_name_value(self):
        """ユーザー作成時のデフォルトの名前が 'New User' であることをテスト"""
        user = CustomUser.objects.create_user(**self.user_data)
        self.assertEqual(user.name, 'New User')

    def test_update_name(self):
        """ユーザーの名前を更新するテスト"""
        user = CustomUser.objects.create_user(**self.user_data)
        user.name = 'Updated User Name'
        user.save()
        self.assertEqual(user.name, 'Updated User Name')
        
class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='testuser@example.com',
            password='testpassword123',
            user_type='student'
        )

    def test_create_notification(self):
        """通知が正常に作成されることをテスト"""
        notification = Notification.objects.create(
            user=self.user,
            title="Test Notification",
            message="This is a test notification.",
            link="http://example.com/test"
        )
        self.assertEqual(notification.user, self.user)
        self.assertEqual(notification.title, "Test Notification")
        self.assertEqual(notification.message, "This is a test notification.")
        self.assertEqual(notification.link, "http://example.com/test")
        self.assertEqual(notification.event_type, "general")  # event_type のデフォルト値を確認
        self.assertIsNotNone(notification.created_at)
        self.assertFalse(notification.is_read)  # is_read のデフォルト値を確認

    def test_mark_notification_as_read(self):
        """通知の既読状態を更新することをテスト"""
        notification = Notification.objects.create(
            user=self.user,
            title="Test Notification",
            message="This is a test notification."
        )
        self.assertFalse(notification.is_read)  # 初期値は False のはず

        notification.is_read = True
        notification.save()

        updated_notification = Notification.objects.get(id=notification.id)
        self.assertTrue(updated_notification.is_read)  # 既読状態が更新されていることを確認

    def test_notification_without_link(self):
        """リンクが設定されていない通知が正常に作成されることをテスト"""
        notification = Notification.objects.create(
            user=self.user,
            title="Notification Without Link",
            message="This notification has no link."
        )
        self.assertEqual(notification.user, self.user)
        self.assertEqual(notification.title, "Notification Without Link")
        self.assertEqual(notification.message, "This notification has no link.")
        self.assertIsNone(notification.link)
        self.assertFalse(notification.is_read)  # 初期値の確認

    def test_notification_event_type(self):
        """event_type フィールドが正しく設定されることをテスト"""
        notification = Notification.objects.create(
            user=self.user,
            title="Custom Event Notification",
            message="This notification has a custom event type.",
            event_type="custom_event"
        )
        self.assertEqual(notification.event_type, "custom_event")  # カスタムの event_type を確認
        self.assertFalse(notification.is_read)  # 初期値の確認

    def test_notification_str_method(self):
        """Notification の __str__ メソッドが正しい形式を返すことをテスト"""
        notification = Notification.objects.create(
            user=self.user,
            title="Test Notification",
            message="This is a test notification."
        )
        self.assertEqual(str(notification), f"{self.user.email} - Test Notification")

    def test_delete_user_deletes_notifications(self):
        """ユーザーを削除したときに、そのユーザーの通知がすべて削除されることをテスト"""
        Notification.objects.create(
            user=self.user,
            title="Test Notification 1",
            message="This is the first test notification."
        )
        Notification.objects.create(
            user=self.user,
            title="Test Notification 2",
            message="This is the second test notification."
        )

        self.assertEqual(Notification.objects.filter(user=self.user).count(), 2)
        self.user.delete()
        self.assertEqual(Notification.objects.filter(user=self.user).count(), 0)

    def test_mark_all_notifications_as_read(self):
        """ユーザーのすべての通知を既読にすることをテスト"""
        Notification.objects.create(
            user=self.user,
            title="Test Notification 1",
            message="This is the first test notification."
        )
        Notification.objects.create(
            user=self.user,
            title="Test Notification 2",
            message="This is the second test notification."
        )

        self.assertEqual(Notification.objects.filter(user=self.user, is_read=False).count(), 2)

        # 全ての通知を既読にする
        Notification.objects.filter(user=self.user).update(is_read=True)

        self.assertEqual(Notification.objects.filter(user=self.user, is_read=False).count(), 0)
        self.assertEqual(Notification.objects.filter(user=self.user, is_read=True).count(), 2)

class MessageModelTest(TestCase):

    def setUp(self):
        self.sender = CustomUser.objects.create_user(
            email='sender@example.com',
            password='password123',
            user_type='student'
        )
        self.receiver = CustomUser.objects.create_user(
            email='receiver@example.com',
            password='password123',
            user_type='teacher'
        )

    def test_create_message(self):
        """メッセージが正常に作成されることをテスト"""
        message = Message.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            content="Hello, this is a test message!"
        )
        self.assertEqual(message.sender, self.sender)
        self.assertEqual(message.receiver, self.receiver)
        self.assertEqual(message.content, "Hello, this is a test message!")
        self.assertFalse(message.is_read)  # is_read のデフォルト値を確認
        self.assertIsNotNone(message.timestamp)

    def test_mark_message_as_read(self):
        """メッセージを既読にすることをテスト"""
        message = Message.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            content="This is a test message!"
        )
        self.assertFalse(message.is_read)  # 初期値は False のはず

        # 既読にする
        message.is_read = True
        message.save()

        updated_message = Message.objects.get(id=message.id)
        self.assertTrue(updated_message.is_read)

    def test_delete_user_deletes_messages(self):
        """ユーザーを削除したときに、そのユーザーが関係するメッセージが削除されることをテスト"""
        Message.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            content="Message from sender to receiver"
        )
        Message.objects.create(
            sender=self.receiver,
            receiver=self.sender,
            content="Message from receiver to sender"
        )

        self.assertEqual(Message.objects.filter(sender=self.sender).count(), 1)
        self.assertEqual(Message.objects.filter(receiver=self.receiver).count(), 1)

        # sender を削除
        self.sender.delete()

        self.assertEqual(Message.objects.filter(sender=self.sender).count(), 0)
        self.assertEqual(Message.objects.filter(receiver=self.sender).count(), 0)

    def test_message_str_method(self):
        """Message の __str__ メソッドが正しい形式を返すことをテスト"""
        message = Message.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            content="Test message content"
        )
        expected_str = f"Message from {self.sender} to {self.receiver} at {message.timestamp}"
        self.assertEqual(str(message), expected_str)

    def test_send_multiple_messages(self):
        """同一の送信者と受信者間で複数のメッセージを送信できることをテスト"""
        Message.objects.create(sender=self.sender, receiver=self.receiver, content="First message")
        Message.objects.create(sender=self.sender, receiver=self.receiver, content="Second message")
        Message.objects.create(sender=self.receiver, receiver=self.sender, content="Reply message")

        self.assertEqual(Message.objects.filter(sender=self.sender, receiver=self.receiver).count(), 2)
        self.assertEqual(Message.objects.filter(sender=self.receiver, receiver=self.sender).count(), 1)

    def test_message_ordering(self):
        """メッセージがタイムスタンプの順で正しく並べられることをテスト"""
        message1 = Message.objects.create(sender=self.sender, receiver=self.receiver, content="First message")
        message2 = Message.objects.create(sender=self.sender, receiver=self.receiver, content="Second message")
        messages = Message.objects.filter(sender=self.sender, receiver=self.receiver).order_by('timestamp')

        self.assertEqual(messages[0], message1)
        self.assertEqual(messages[1], message2)
