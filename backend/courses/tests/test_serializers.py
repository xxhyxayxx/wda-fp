from django.test import TestCase
from accounts.models import CustomUser
from courses.models import Course, Module, File, Enrollment, Course, ModuleProgress
from courses.serializers import CourseSerializer, ModuleSerializer, FileSerializer, EnrollmentSerializer, ModuleProgressSerializer
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory
from rest_framework.exceptions import ValidationError

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
        # テスト用の教師ユーザーを作成
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

        # 単一ファイルと複数ファイルを用意
        self.test_file_1 = SimpleUploadedFile("test_file_1.pdf", b"file_content_1", content_type="application/pdf")
        self.test_file_2 = SimpleUploadedFile("test_file_2.pdf", b"file_content_2", content_type="application/pdf")

        self.multiple_files_data = {
            'module': self.module.id,
        }

    def test_multiple_files_serializer_valid_data(self):
        # 複数ファイルのアップロードテスト

        # APIRequestFactoryを使用してリクエストを作成
        factory = APIRequestFactory()

        # request.FILES に複数ファイルをセット
        request = factory.post('/files/', self.multiple_files_data, format='multipart')
        request.user = self.teacher  # ユーザー情報を設定

        # 複数ファイルをFILESにセット
        request.FILES.setlist('file', [self.test_file_1, self.test_file_2])

        # 複数ファイルを個別に保存
        files = []
        for file_data in request.FILES.getlist('file'):
            file_serializer = FileSerializer(data={
                'file': file_data,
                'module': self.module.id,  # module IDを渡す
                'created_by': self.teacher,
            }, context={'request': request})  # contextにrequestを渡す

            # バリデーションを行い、エラーがあれば表示
            if not file_serializer.is_valid():
                print(f"Validation errors for {file_data.name}: {file_serializer.errors}")
                raise ValidationError(f"Validation failed for {file_data.name}")

            # バリデーションが通れば保存
            files.append(file_serializer.save())

        # 保存されたファイルが2つであることを確認
        self.assertEqual(len(files), 2)

        # ファイル1の検証
        self.assertIn('course_files/test_file_1', files[0].file.name)  # ファイル名が設定されていることを確認
        self.assertEqual(files[0].created_by, self.teacher)

        # ファイル2の検証
        self.assertIn('course_files/test_file_2', files[1].file.name)  # ファイル名が設定されていることを確認
        self.assertEqual(files[1].created_by, self.teacher)

    def test_serializer_invalid_data(self):
        # 無効なデータのテスト（ファイルがない場合など）
        invalid_data = {
            'module': self.module.id,
            'file': None,
        }
        file_serializer = FileSerializer(data=invalid_data)

        self.assertFalse(file_serializer.is_valid())  # バリデーションが失敗することを確認
        self.assertIn('file', file_serializer.errors)  # エラーメッセージが含まれていることを確認

class EnrollmentSerializerTest(TestCase):
    def setUp(self):
        # 必要なデータを作成
        self.teacher = CustomUser.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            user_type='teacher'
        )
        self.student = CustomUser.objects.create_user(
            email='student@example.com',
            password='testpassword',
            user_type='student'
        )
        self.course = Course.objects.create(
            title='Test Course',
            created_by=self.teacher
        )
        self.enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course,
            progress=75.5
        )

    def test_serialization(self):
        serializer = EnrollmentSerializer(self.enrollment)
        data = serializer.data

        # 各フィールドの検証
        self.assertEqual(data['student'], self.student.id)
        self.assertEqual(data['course']['id'], self.course.id)  # ネストされたコースデータを確認
        self.assertEqual(data['progress'], 75)  # 小数点以下を切り捨てて整数化されていることを確認
        self.assertEqual(data['status'], 'ENROLLED')

class ModuleProgressSerializerTest(TestCase):
    def setUp(self):
        # 必要なデータを作成
        self.teacher = CustomUser.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            user_type='teacher'
        )
        self.student = CustomUser.objects.create_user(
            email='student@example.com',
            password='testpassword',
            user_type='student'
        )
        self.course = Course.objects.create(
            title='Test Course',
            created_by=self.teacher
        )
        self.module = Module.objects.create(
            course=self.course,
            title='Test Module',
            description='Module Description',
            created_by=self.teacher
        )
        # Enrollmentを作成
        self.enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course
        )
        # ModuleProgressを作成
        self.progress = ModuleProgress.objects.create(
            enrollment=self.enrollment,
            module=self.module,
            is_completed=True
        )

    def test_serialization(self):
        # self.progress が正しく設定されていることを確認
        serializer = ModuleProgressSerializer(self.progress)
        data = serializer.data

        # 各フィールドの検証
        self.assertEqual(data['enrollment'], self.enrollment.id)
        self.assertTrue(data['is_completed'])

        # ネストされたモジュール情報の確認
        self.assertEqual(data['module']['id'], self.module.id)  # モジュールの ID を確認
        self.assertEqual(data['module']['title'], 'Test Module')  # モジュールのタイトルを確認
        self.assertEqual(data['module']['description'], 'Module Description')  # モジュールの説明を確認
