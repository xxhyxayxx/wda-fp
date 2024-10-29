from django.test import TestCase
from accounts.models import CustomUser
from courses.models import Course
from courses.serializers import CourseSerializer

class CourseSerializerTest(TestCase):

    def setUp(self):
        # テスト用の教師ユーザーを作成
        self.teacher = CustomUser.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            name='Test Teacher',
            user_type='teacher'
        )

        # テスト用のコースデータ
        self.course_data = {
            'title': 'Test Course',
            'description': 'This is a test course.',
            'category': 'Test Category',
            'is_published': True,
        }

    def test_course_serializer_valid_data(self):
        # シリアライザーでのバリデーションが成功することを確認
        serializer = CourseSerializer(data=self.course_data, context={'request': self._get_request()})
        self.assertTrue(serializer.is_valid())
        
        # シリアライザーの保存
        course = serializer.save()
        
        # コースが正しく作成されていることを確認
        self.assertEqual(course.title, 'Test Course')
        self.assertEqual(course.description, 'This is a test course.')
        self.assertEqual(course.category, 'Test Category')
        self.assertTrue(course.is_published)
        self.assertEqual(course.created_by, self.teacher)

    def test_course_serializer_read_only_fields(self):
        # コースを作成
        course = Course.objects.create(
            title='ReadOnly Test Course',
            description='Testing read-only fields.',
            category='Test',
            is_published=False,
            created_by=self.teacher
        )

        # シリアライザーでシリアライズ
        serializer = CourseSerializer(course)
        data = serializer.data
        
        # 'created_by_name' が正しく表示されているかを確認
        self.assertEqual(data['created_by_name'], 'Test Teacher')
        
        # 'created_at'と'updated_at'が正しく存在するかを確認
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)

    def _get_request(self):
        # テスト用の疑似リクエストを作成
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/courses/', self.course_data)
        request.user = self.teacher
        return request
