from django.test import TestCase
from django.contrib.auth import get_user_model
from courses.models import Course, Module, File

User = get_user_model()

class CourseModelTest(TestCase):

    def setUp(self):
        # テスト用の教師ユーザーを作成
        self.teacher = User.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            user_type='teacher'
        )

    def test_course_creation(self):
        # コースの作成
        course = Course.objects.create(
            title='Test Course',
            description='This is a test course.',
            category='Test Category',
            is_published=True,
            created_by=self.teacher
        )

        # モデルフィールドの正確な設定を確認
        self.assertEqual(course.title, 'Test Course')
        self.assertEqual(course.description, 'This is a test course.')
        self.assertEqual(course.category, 'Test Category')
        self.assertTrue(course.is_published)
        self.assertEqual(course.created_by, self.teacher)

    def test_course_str_method(self):
        # コースの作成
        course = Course.objects.create(
            title='Another Test Course',
            description='This is another test course.',
            created_by=self.teacher
        )

        # __str__メソッドの結果を確認
        self.assertEqual(str(course), f"{course.title} by {self.teacher.name} at {course.created_at}")

    def test_course_update(self):
        # コースの作成
        course = Course.objects.create(
            title='Update Test Course',
            created_by=self.teacher
        )

        # コースのタイトルを更新
        course.title = 'Updated Course Title'
        course.save()

        # 更新の結果を確認
        self.assertEqual(course.title, 'Updated Course Title')

    def test_course_deletion(self):
        # コースの作成
        course = Course.objects.create(
            title='Delete Test Course',
            created_by=self.teacher
        )

        # コースの削除
        course.delete()

        # コースが削除されたかを確認
        self.assertFalse(Course.objects.filter(title='Delete Test Course').exists())

class ModuleModelTest(TestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            user_type='teacher'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='This is a test course.',
            created_by=self.teacher
        )

    def test_module_creation(self):
        # モジュールの作成
        module = Module.objects.create(
            course=self.course,
            title='Test Module',
            description='This is a test module.',
            created_by=self.teacher  # 作成者を設定
        )
        
        # モデルフィールドの正確な設定を確認
        self.assertEqual(module.course, self.course)
        self.assertEqual(module.title, 'Test Module')
        self.assertEqual(module.description, 'This is a test module.')
        self.assertEqual(module.created_by, self.teacher)  # 作成者の確認

    def test_module_str_method(self):
        module = Module.objects.create(
            course=self.course,
            title='Module Title',
            created_by=self.teacher
        )
        self.assertEqual(str(module), f"{self.course.title} - {module.title}")

    def test_module_deletion(self):
        module = Module.objects.create(
            course=self.course,
            title='Module to Delete',
            created_by=self.teacher
        )
        module.delete()
        self.assertFalse(Module.objects.filter(title='Module to Delete').exists())

class FileModelTest(TestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            user_type='teacher'
        )
        self.course = Course.objects.create(
            title='Test Course',
            created_by=self.teacher
        )
        self.module = Module.objects.create(
            course=self.course,
            title='Test Module',
            created_by=self.teacher
        )

    def test_file_creation(self):
        # ファイルの作成
        file = File.objects.create(
            module=self.module,
            file='course_files/test_file.pdf',  # 実際にアップロードするパス
            created_by=self.teacher  # 作成者を設定
        )
        
        # モデルフィールドの正確な設定を確認
        self.assertEqual(file.module, self.module)
        self.assertTrue(file.file.name.startswith('course_files/test_file.pdf'))  # ファイルパスの確認
        self.assertEqual(file.created_by, self.teacher)  # 作成者の確認

    def test_file_deletion(self):
        # ファイルを作成
        file = File.objects.create(
            module=self.module,
            file='course_files/file_to_delete.pdf',
            created_by=self.teacher
        )
        
        # ファイルの削除
        file.delete()
        
        # ファイルが削除されていることを確認
        self.assertFalse(File.objects.filter(file='course_files/file_to_delete.pdf').exists())  # フィルタリングの修正
