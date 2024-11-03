from django.test import TestCase
from accounts.models import CustomUser
from courses.models import Course, Module, File
from courses.serializers import CourseSerializer, ModuleSerializer, FileSerializer
from django.core.files.uploadedfile import SimpleUploadedFile

class CourseSerializerTest(TestCase):

    def setUp(self):
        # テスト用の教師ユーザーを作成
        self.teacher = CustomUser.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            name='Test Teacher',
            user_type='teacher'
        )
        self.course_data = {
            'title': 'Test Course',
            'description': 'This is a test course.',
            'category': 'Test Category',
            'is_published': True,
        }

    def test_course_serializer_valid_data(self):
        serializer = CourseSerializer(data=self.course_data, context={'request': self._get_request()})
        self.assertTrue(serializer.is_valid())
        course = serializer.save(created_by=self.teacher)
        self.assertEqual(course.title, 'Test Course')
        self.assertEqual(course.description, 'This is a test course.')
        self.assertEqual(course.category, 'Test Category')
        self.assertTrue(course.is_published)
        self.assertEqual(course.created_by, self.teacher)

    def test_course_serializer_read_only_fields(self):
        course = Course.objects.create(
            title='ReadOnly Test Course',
            description='Testing read-only fields.',
            category='Test',
            is_published=False,
            created_by=self.teacher
        )
        serializer = CourseSerializer(course)
        data = serializer.data
        self.assertEqual(data['created_by_name'], 'Test Teacher')
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)

    def _get_request(self):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/courses/', self.course_data)
        request.user = self.teacher
        return request

class ModuleSerializerTest(TestCase):

    def setUp(self):
        self.teacher = CustomUser.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            name='Test Teacher',
            user_type='teacher'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='This is a test course.',
            created_by=self.teacher
        )
        self.module_data = {
            'course': self.course.id,
            'title': 'Test Module',
            'description': 'This is a test module.',
        }

    def test_module_serializer_valid_data(self):
        serializer = ModuleSerializer(data=self.module_data, context={'request': self._get_request()})
        self.assertTrue(serializer.is_valid())
        module = serializer.save(created_by=self.teacher)
        self.assertEqual(module.title, 'Test Module')
        self.assertEqual(module.description, 'This is a test module.')
        self.assertEqual(module.created_by, self.teacher)

    def test_module_serializer_read_only_fields(self):
        module = Module.objects.create(
            course=self.course,
            title='ReadOnly Test Module',
            description='Testing read-only fields.',
            created_by=self.teacher
        )
        serializer = ModuleSerializer(module)
        data = serializer.data
        self.assertEqual(data['course_title'], self.course.title)
        self.assertEqual(data['created_by_name'], 'Test Teacher')

    def _get_request(self):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/modules/', self.module_data)
        request.user = self.teacher
        return request

class FileSerializerTest(TestCase):

    def setUp(self):
        self.teacher = CustomUser.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            name='Test Teacher',
            user_type='teacher'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='This is a test course.',
            created_by=self.teacher
        )
        self.module = Module.objects.create(
            course=self.course,
            title='Test Module',
            created_by=self.teacher
        )
        self.test_file = SimpleUploadedFile("test_file.pdf", b"file_content", content_type="application/pdf")
        self.file_data = {
            'module': self.module.id,
            'file': self.test_file,
            'title': 'Test File',
        }

    def test_file_serializer_valid_data(self):
        serializer = FileSerializer(data=self.file_data, context={'request': self._get_request()})
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        file = serializer.save(created_by=self.teacher)
        self.assertEqual(file.title, 'Test File')
        self.assertIn('course_files/test_file', file.file.name)
        self.assertEqual(file.created_by, self.teacher)

    def test_file_serializer_read_only_fields(self):
        file = File.objects.create(
            module=self.module,
            file=self.test_file,
            title='ReadOnly Test File',
            created_by=self.teacher
        )
        serializer = FileSerializer(file)
        data = serializer.data
        self.assertEqual(data['module_title'], self.module.title)
        self.assertEqual(data['created_by_name'], 'Test Teacher')

    def _get_request(self):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/files/', self.file_data)
        request.user = self.teacher
        return request
