from django.test import TestCase
from django.contrib.auth import get_user_model
from courses.models import Course, Module, File, Enrollment, ModuleProgress, Feedback

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

class EnrollmentModelTest(TestCase):

    def setUp(self):
        # テスト用のユーザーとコースを作成
        self.student = User.objects.create_user(
            email='student@example.com',
            password='testpassword',
            user_type='student'
        )
        self.teacher = User.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            user_type='teacher'
        )
        self.course = Course.objects.create(
            title='Test Course',
            created_by=self.teacher
        )

    def test_enrollment_creation(self):
        # Enrollmentの作成
        enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course,
            status='ENROLLED'
        )

        # モデルフィールドの確認
        self.assertEqual(enrollment.student, self.student)
        self.assertEqual(enrollment.course, self.course)
        self.assertEqual(enrollment.status, 'ENROLLED')
        self.assertEqual(enrollment.progress, 0.00)  # 初期進捗は0%

    def test_enrollment_str_method(self):
        enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course,
            status='ENROLLED'
        )
        self.assertEqual(str(enrollment), f"{self.student.name} - {self.course.title} (ENROLLED)")

    def test_enrollment_unique_constraint(self):
        # 同じコースに重複登録が禁止されているか確認
        Enrollment.objects.create(student=self.student, course=self.course)
        with self.assertRaises(Exception):  # IntegrityErrorを捕捉
            Enrollment.objects.create(student=self.student, course=self.course)
            
class ModuleProgressModelTest(TestCase):

    def setUp(self):
        # テスト用のデータ作成
        self.student = User.objects.create_user(
            email='student@example.com',
            password='testpassword',
            user_type='student'
        )
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
        self.enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course
        )

    def test_module_progress_creation(self):
        # ModuleProgressの作成
        progress = ModuleProgress.objects.create(
            enrollment=self.enrollment,
            module=self.module,
            is_completed=True
        )

        # モデルフィールドの確認
        self.assertEqual(progress.enrollment, self.enrollment)
        self.assertEqual(progress.module, self.module)
        self.assertTrue(progress.is_completed)
        self.assertIsNotNone(progress.completed_at)  # 完了日時が記録されているか確認

    def test_module_progress_str_method(self):
        progress = ModuleProgress.objects.create(
            enrollment=self.enrollment,
            module=self.module,
            is_completed=False
        )
        self.assertEqual(str(progress), f"{self.student.name} - {self.module.title} (In Progress)")

    def test_module_progress_unique_constraint(self):
        # 同じモジュールの進捗データが複数作成されないか確認
        ModuleProgress.objects.create(enrollment=self.enrollment, module=self.module)
        with self.assertRaises(Exception):  # IntegrityErrorを捕捉
            ModuleProgress.objects.create(enrollment=self.enrollment, module=self.module)
            
class FeedbackModelTest(TestCase):

    def setUp(self):
        # テスト用のデータ作成
        self.student = User.objects.create_user(
            email='student@example.com',
            password='testpassword',
            user_type='student'
        )
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
        self.enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course
        )

    def test_feedback_creation(self):
        # フィードバックの作成
        feedback = Feedback.objects.create(
            enrollment=self.enrollment,
            rating=5,
            comment='Great course!'
        )

        # モデルフィールドの確認
        self.assertEqual(feedback.enrollment, self.enrollment)
        self.assertEqual(feedback.rating, 5)
        self.assertEqual(feedback.comment, 'Great course!')
        self.assertIsNotNone(feedback.created_at)  # 作成日時が設定されているか確認

    def test_feedback_str_method(self):
        feedback = Feedback.objects.create(
            enrollment=self.enrollment,
            rating=4,
            comment='Good course, but could be better.'
        )
        self.assertEqual(
            str(feedback),
            f"{self.enrollment.student.name} - {self.enrollment.course.title} (4 Stars)"
        )

    def test_feedback_unique_constraint(self):
        # 同じEnrollmentに対して複数のFeedbackが作成されないか確認
        Feedback.objects.create(enrollment=self.enrollment, rating=5, comment='Excellent!')
        with self.assertRaises(Exception):  # IntegrityErrorを捕捉
            Feedback.objects.create(enrollment=self.enrollment, rating=4, comment='Duplicate Feedback')
