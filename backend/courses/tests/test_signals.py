from django.test import TestCase
from django.db.models.signals import post_save
from unittest.mock import patch
from courses.models import Course
from accounts.tasks import generate_notification

class TestCourseSignals(TestCase):

    @patch('accounts.tasks.generate_notification.delay')
    def test_send_course_creation_notification(self, mock_generate_notification):
        """
        シグナルがトリガーされ、generate_notification タスクが呼び出されることを確認する
        """
        # コースを新規作成
        course = Course.objects.create(
            title="Test Course",
            description="This is a test course.",
            created_by=self._create_teacher_user()  # 教師ユーザーを作成するヘルパー関数
        )

        # シグナルが正しく呼び出されたかを確認
        mock_generate_notification.assert_called_once_with(
            event_type="course_release",
            title="New Course Released",
            message=f"The course '{course.title}' has just been released!",
            link=f"/courses/{course.id}/"
        )

    def _create_teacher_user(self):
        """
        テスト用の教師ユーザーを作成するヘルパーメソッド
        """
        from accounts.models import CustomUser
        return CustomUser.objects.create_user(
            email="teacher@example.com",
            password="password",
            user_type="teacher"
        )
