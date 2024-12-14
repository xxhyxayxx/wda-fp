from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import Notification

CustomUser = get_user_model()

class CustomUserModelTest(TestCase):

    def setUp(self):
        self.user_data = {
            'email': 'testuser@example.com',
            'password': 'testpassword123',
            'user_type': 'student'
        }

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
        """プロフィール画像のデフォルト値が設定されていることをテスト"""
        user = CustomUser.objects.create_user(email='profileuser@example.com', password='profilepassword')
        self.assertEqual(user.profile_image.name, 'profile_images/default_profile.png')

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
        self.assertIsNotNone(notification.created_at)

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