from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from accounts.models import CustomUser
from courses.models import Course, Module, File, Enrollment, ModuleProgress, Feedback
import hashlib
from django.utils.timezone import now

def get_file_hash(file):
    """ファイルのハッシュ値を取得"""
    md5 = hashlib.md5()
    for chunk in file.chunks():
        md5.update(chunk)
    return md5.hexdigest()

class CourseViewTest(APITestCase):

    def setUp(self):
        self.teacher = CustomUser.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            name='Teacher User',
            user_type='teacher'
        )
        self.student = CustomUser.objects.create_user(
            email='student@example.com',
            password='testpassword',
            name='Student User',
            user_type='student'
        )

        self.course_data = {
            'title': 'Test Course',
            'description': 'This is a test course.',
            'category': 'Test Category',
            'is_published': True,
        }

        self.create_url = reverse('course-create')
        self.update_url = lambda pk: reverse('course-update', args=[pk])
        self.delete_url = lambda pk: reverse('course-delete', args=[pk])

    def test_teacher_can_create_course(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(self.create_url, self.course_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.count(), 1)
        self.assertEqual(Course.objects.first().title, 'Test Course')

    def test_student_cannot_create_course(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.create_url, self.course_data)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_update_course(self):
        course = Course.objects.create(created_by=self.teacher, **self.course_data)
        updated_data = {
            'title': 'Updated Course Title',
            'description': 'Updated description.',
            'category': 'Updated Category',
            'is_published': False,
        }

        self.client.force_authenticate(user=self.teacher)
        response = self.client.put(self.update_url(course.pk), updated_data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        course.refresh_from_db()
        self.assertEqual(course.title, 'Updated Course Title')

    def test_student_cannot_update_course(self):
        course = Course.objects.create(created_by=self.teacher, **self.course_data)

        self.client.force_authenticate(user=self.student)
        response = self.client.put(self.update_url(course.pk), self.course_data)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_delete_course(self):
        course = Course.objects.create(created_by=self.teacher, **self.course_data)

        self.client.force_authenticate(user=self.teacher)
        response = self.client.delete(self.delete_url(course.pk))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Course.objects.count(), 0)

    def test_student_cannot_delete_course(self):
        course = Course.objects.create(created_by=self.teacher, **self.course_data)

        self.client.force_authenticate(user=self.student)
        response = self.client.delete(self.delete_url(course.pk))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class ModuleViewTest(APITestCase):
    
    def setUp(self):
        self.teacher = CustomUser.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            name='Teacher User',
            user_type='teacher'
        )
        self.student = CustomUser.objects.create_user(
            email='student@example.com',
            password='testpassword',
            name='Student User',
            user_type='student'
        )
        
        self.course = Course.objects.create(
            title='Test Course',
            description='This is a test course.',
            category='Test Category',
            is_published=True,
            created_by=self.teacher
        )
        
        self.module_data = {
            'course': self.course.pk,
            'title': 'Test Module',
            'description': 'This is a test module.',
        }

        self.create_url = reverse('module-create')
        self.update_url = lambda pk: reverse('module-update', args=[pk])
        self.delete_url = lambda pk: reverse('module-delete', args=[pk])

    def test_teacher_can_create_module(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(self.create_url, self.module_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Module.objects.count(), 1)
        self.assertEqual(Module.objects.first().title, 'Test Module')

    def test_student_cannot_create_module(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.create_url, self.module_data)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_update_module(self):
        module = Module.objects.create(
            course=self.course,
            title=self.module_data['title'],
            description=self.module_data['description'],
            created_by=self.teacher
        )
        updated_data = {
            'title': 'Updated Module Title',
            'description': 'Updated description.',
            'course': self.course.pk,
        }

        self.client.force_authenticate(user=self.teacher)
        response = self.client.put(self.update_url(module.pk), updated_data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        module.refresh_from_db()
        self.assertEqual(module.title, 'Updated Module Title')

    def test_student_cannot_update_module(self):
        module = Module.objects.create(
            course=self.course,
            title=self.module_data['title'],
            description=self.module_data['description'],
            created_by=self.teacher
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.put(self.update_url(module.pk), self.module_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_teacher_can_delete_module(self):
        module = Module.objects.create(
            course=self.course,
            title=self.module_data['title'],
            description=self.module_data['description'],
            created_by=self.teacher
        )

        self.client.force_authenticate(user=self.teacher)
        response = self.client.delete(self.delete_url(module.pk))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Module.objects.count(), 0)

    def test_student_cannot_delete_module(self):
        module = Module.objects.create(
            course=self.course,
            title=self.module_data['title'],
            description=self.module_data['description'],
            created_by=self.teacher
        )

        self.client.force_authenticate(user=self.student)
        response = self.client.delete(self.delete_url(module.pk))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class FileBatchUpdateTest(APITestCase):

    def setUp(self):
        self.teacher = CustomUser.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            name='Teacher User',
            user_type='teacher'
        )
        self.student = CustomUser.objects.create_user(
            email='student@example.com',
            password='testpassword',
            name='Student User',
            user_type='student'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='This is a test course.',
            category='Test Category',
            is_published=True,
            created_by=self.teacher
        )
        self.module = Module.objects.create(
            course=self.course,
            title='Test Module',
            created_by=self.teacher
        )
        # テスト用ファイルのセットアップ
        self.test_file_1 = SimpleUploadedFile("test_file_1.pdf", b"file_content_1", content_type="application/pdf")
        self.test_file_2 = SimpleUploadedFile("test_file_2.pdf", b"file_content_2", content_type="application/pdf")
        
        # ファイルバッチ更新エンドポイントのURL
        self.batch_update_url = reverse('file-batch-update')

    def test_teacher_can_batch_update_files(self):
        # 初期ファイルの作成
        existing_file = File.objects.create(module=self.module, file=self.test_file_1, created_by=self.teacher)

        # 新規ファイルと更新ファイルの準備
        new_file = SimpleUploadedFile("new_test_file.pdf", b"new file content", content_type="application/pdf")
        updated_file = SimpleUploadedFile("updated_test_file_1.pdf", b"updated file content 1", content_type="application/pdf")

        # バッチ更新リクエストの準備
        data = {
            'module': self.module.pk,
            'files_to_create': [new_file],  # 新規ファイル
            'files_to_update': [updated_file],  # 既存ファイルの更新
            'files_to_update_ids': [existing_file.pk],  # 更新するファイルのID
            'files_to_delete': [existing_file.pk],  # 削除するファイルID
        }

        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(self.batch_update_url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 作成、更新、削除が正しく行われたかの確認
        created_files = response.data.get('created')
        updated_files = response.data.get('updated')
        deleted_files = response.data.get('deleted')

        self.assertEqual(len(created_files), 1)  # 新規ファイルが1件作成される
        self.assertEqual(len(updated_files), 1)  # 既存ファイルが1件更新される
        self.assertEqual(len(deleted_files), 1)  # 削除対象のファイルが1件削除される

        # ファイル数を確認
        self.assertEqual(File.objects.filter(module=self.module).count(), 1)

    def test_student_cannot_batch_update_files(self):
        existing_file = File.objects.create(module=self.module, file=self.test_file_1, created_by=self.teacher)
        new_file = SimpleUploadedFile("new_test_file.pdf", b"new file content", content_type="application/pdf")
        updated_file = SimpleUploadedFile("updated_test_file_1.pdf", b"updated file content 1", content_type="application/pdf")

        data = {
            'module': self.module.pk,
            'files_to_create': [new_file],
            'files_to_update': [updated_file],
            'files_to_update_ids': [existing_file.pk],
            'files_to_delete': [existing_file.pk],
        }

        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.batch_update_url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_batch_update_files_with_missing_data(self):
        # 必要なデータを送信しなかった場合のエラーハンドリング
        data = {
            'module': self.module.pk,
            'files_to_create': [],
            'files_to_update': [],
            'files_to_update_ids': [],
            'files_to_delete': [],
        }

        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(self.batch_update_url, data, format='multipart')

        # 正常に実行されるが、処理されるファイルがない場合
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['created']), 0)
        self.assertEqual(len(response.data['updated']), 0)
        self.assertEqual(len(response.data['deleted']), 0)

class FileListAPIViewTest(FileBatchUpdateTest):
    def setUp(self):
        super().setUp()
        self.client.force_authenticate(user=self.teacher)  # 認証の追加

        # テスト用のモジュールとファイルの追加
        self.module1 = Module.objects.create(course=self.course, title="Module 1", created_by=self.teacher)
        self.module2 = Module.objects.create(course=self.course, title="Module 2", created_by=self.teacher)
        self.file1 = File.objects.create(module=self.module1, file="file1.txt", created_by=self.teacher)
        self.file2 = File.objects.create(module=self.module1, file="file2.txt", created_by=self.teacher)
        self.file3 = File.objects.create(module=self.module2, file="file3.txt", created_by=self.teacher)

        # エンドポイントURL
        self.file_list_url = reverse('file-list')

    def test_get_all_files(self):
        """すべてのファイルを取得する"""
        response = self.client.get(self.file_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)  # 3つのファイルが存在する

    def test_get_files_by_module_id(self):
        """特定のモジュールに関連付けられたファイルを取得する"""
        response = self.client.get(self.file_list_url, {'module': self.module1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # module1に関連付けられた2つのファイルが存在する

    def test_no_files_for_invalid_module_id(self):
        """無効なモジュールIDでファイルを取得する場合"""
        response = self.client.get(self.file_list_url, {'module': 999})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])  # ファイルがない場合は空のリストが返される

class EnrollmentAPIViewTest(APITestCase):

    def setUp(self):
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
            description='This is a test course.',
            created_by=self.teacher
        )
        self.enroll_url = reverse('course-enroll', args=[self.course.id])

    def test_student_can_enroll(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.enroll_url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Enrollment.objects.count(), 1)
        self.assertEqual(Enrollment.objects.first().student, self.student)

    def test_teacher_cannot_enroll(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(self.enroll_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_enroll_twice(self):
        Enrollment.objects.create(student=self.student, course=self.course)

        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.enroll_url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Enrollment.objects.count(), 1)

class CompleteModuleAPIViewTest(APITestCase):

    def setUp(self):
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
            description='This is a test course.',
            created_by=self.teacher
        )
        self.module = Module.objects.create(
            course=self.course,
            title='Test Module',
            created_by=self.teacher
        )
        self.complete_url = reverse('module-complete', args=[self.module.id])

    def test_student_can_complete_module(self):
        enrollment = Enrollment.objects.create(student=self.student, course=self.course)

        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.complete_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ModuleProgress.objects.count(), 1)

        progress = ModuleProgress.objects.first()
        self.assertTrue(progress.is_completed)
        self.assertIsNotNone(progress.completed_at)

    def test_non_enrolled_student_cannot_complete_module(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.complete_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(ModuleProgress.objects.count(), 0)

class EnrolledCoursesAPIViewTest(APITestCase):
    def setUp(self):
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
        self.other_student = CustomUser.objects.create_user(
            email='other_student@example.com',
            password='testpassword',
            user_type='student'
        )
        self.course1 = Course.objects.create(
            title='Course 1',
            description='Description for course 1',
            created_by=self.teacher
        )
        self.course2 = Course.objects.create(
            title='Course 2',
            description='Description for course 2',
            created_by=self.teacher
        )
        # 学生をそれぞれのコースに登録
        Enrollment.objects.create(student=self.student, course=self.course1)
        Enrollment.objects.create(student=self.student, course=self.course2)
        Enrollment.objects.create(student=self.other_student, course=self.course2)

        self.enrollments_url = reverse('enrollment-list')

    def test_student_can_get_enrolled_courses(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.enrollments_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # studentは2つのコースに登録されている
        enrolled_course_titles = [enrollment['course']['title'] for enrollment in response.data]
        self.assertIn('Course 1', enrolled_course_titles)
        self.assertIn('Course 2', enrolled_course_titles)

    def test_teacher_cannot_get_enrolled_courses(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get(self.enrollments_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_user_cannot_get_enrolled_courses(self):
        response = self.client.get(self.enrollments_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_with_no_enrollments_gets_empty_list(self):
        self.client.force_authenticate(user=self.other_student)
        response = self.client.get(self.enrollments_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # other_studentは1つのコースに登録されている

class CourseProgressAPIViewTest(APITestCase):

    def setUp(self):
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
            description='This is a test course.',
            created_by=self.teacher
        )
        self.module1 = Module.objects.create(
            course=self.course,
            title='Module 1',
            created_by=self.teacher
        )
        self.module2 = Module.objects.create(
            course=self.course,
            title='Module 2',
            created_by=self.teacher
        )
        self.module3 = Module.objects.create(
            course=self.course,
            title='Module 3',
            created_by=self.teacher
        )
        self.enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course,
            progress=0.00
        )
        self.progress_url = reverse('course-progress', args=[self.course.id])

    def test_course_progress_initially_zero(self):
        """登録直後、進捗率が0%であることを確認"""
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.progress_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['course_progress'], 0.0)  # 初期進捗率
        self.assertEqual(len(response.data['module_progress']), 0)  # モジュール進捗が空

    def test_course_progress_updates_correctly(self):
        """モジュールを完了すると進捗率が更新されることを確認"""
        # 最初のモジュールを完了
        ModuleProgress.objects.create(
            enrollment=self.enrollment,
            module=self.module1,
            is_completed=True,
            completed_at=now()
        )

        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.progress_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data['course_progress'], 33.33, places=2)  # float型で比較
        self.assertEqual(len(response.data['module_progress']), 1)  # 完了したモジュールが1つ

    def test_course_progress_full_completion(self):
        """全モジュールを完了した場合、進捗率が100%になることを確認"""
        ModuleProgress.objects.create(
            enrollment=self.enrollment,
            module=self.module1,
            is_completed=True,
            completed_at=now()
        )
        ModuleProgress.objects.create(
            enrollment=self.enrollment,
            module=self.module2,
            is_completed=True,
            completed_at=now()
        )
        ModuleProgress.objects.create(
            enrollment=self.enrollment,
            module=self.module3,
            is_completed=True,
            completed_at=now()
        )

        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.progress_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data['course_progress'], 100.0, places=2)  # float型で比較
        self.assertEqual(len(response.data['module_progress']), 3)  # 全モジュール進捗が含まれる
        
    def test_unauthorized_access_to_course_progress(self):
        """認証されていないユーザーが進捗を取得できないことを確認"""
        response = self.client.get(self.progress_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_teacher_cannot_access_course_progress(self):
        """教師が進捗を取得できないことを確認"""
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get(self.progress_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class CourseStudentsAPIViewTest(APITestCase):
    def setUp(self):
        self.teacher = CustomUser.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            name='Teacher User',
            user_type='teacher'
        )
        self.student1 = CustomUser.objects.create_user(
            email='student1@example.com',
            password='testpassword',
            name='Student One',
            user_type='student'
        )
        self.student2 = CustomUser.objects.create_user(
            email='student2@example.com',
            password='testpassword',
            name='Student Two',
            user_type='student'
        )

        self.course = Course.objects.create(
            title='Test Course',
            description='This is a test course.',
            category='Test Category',
            is_published=True,
            created_by=self.teacher
        )

        # 学生をコースに登録
        self.enrollment1 = Enrollment.objects.create(student=self.student1, course=self.course, status='ENROLLED')
        self.enrollment2 = Enrollment.objects.create(
            student=self.student2, course=self.course, status='BLOCKED', block_reason='Disruptive behavior'
        )

        # APIエンドポイントURL
        self.course_students_url = reverse('course-students', args=[self.course.id])

    def test_get_students_in_course_with_status(self):
        """コースに登録されている学生とそのステータスを取得"""
        self.client.force_authenticate(user=self.teacher)  # 教師で認証
        response = self.client.get(self.course_students_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # 学生が2人登録されている

        student1_data = next((student for student in response.data if student['id'] == self.student1.id), None)
        student2_data = next((student for student in response.data if student['id'] == self.student2.id), None)

        # Student One のデータ確認
        self.assertIsNotNone(student1_data)
        self.assertEqual(student1_data['status'], 'ENROLLED')
        self.assertIsNone(student1_data['block_reason'])

        # Student Two のデータ確認
        self.assertIsNotNone(student2_data)
        self.assertEqual(student2_data['status'], 'BLOCKED')
        self.assertEqual(student2_data['block_reason'], 'Disruptive behavior')

    def test_no_students_in_course(self):
        """コースに登録された学生がいない場合"""
        empty_course = Course.objects.create(
            title='Empty Course',
            description='No students here.',
            category='Empty Category',
            is_published=True,
            created_by=self.teacher
        )
        empty_course_students_url = reverse('course-students', args=[empty_course.id])

        self.client.force_authenticate(user=self.teacher)  # 教師で認証
        response = self.client.get(empty_course_students_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)  # 登録された学生がいない

    def test_unauthenticated_user_cannot_access_students(self):
        """認証されていないユーザーがコース学生を取得できない"""
        response = self.client.get(self.course_students_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class BlockStudentAPIViewTest(APITestCase):
    def setUp(self):
        self.teacher = CustomUser.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            name='Teacher User',
            user_type='teacher'
        )
        self.student = CustomUser.objects.create_user(
            email='student@example.com',
            password='testpassword',
            name='Student User',
            user_type='student'
        )

        self.course = Course.objects.create(
            title='Test Course',
            description='This is a test course.',
            category='Test Category',
            is_published=True,
            created_by=self.teacher
        )

        self.enrollment = Enrollment.objects.create(student=self.student, course=self.course, status='ENROLLED')

        self.block_student_url = reverse('block-student', args=[self.course.id, self.student.id])

    def test_teacher_can_block_student_with_reason(self):
        """教師が生徒をブロックできることを確認"""
        self.client.force_authenticate(user=self.teacher)
        data = {'reason': 'Disruptive behavior'}
        response = self.client.post(self.block_student_url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.enrollment.refresh_from_db()
        self.assertEqual(self.enrollment.status, 'BLOCKED')
        self.assertEqual(self.enrollment.block_reason, 'Disruptive behavior')

    def test_teacher_can_unblock_student(self):
        """教師が生徒をブロック解除できることを確認"""
        self.enrollment.status = 'BLOCKED'
        self.enrollment.block_reason = 'Disruptive behavior'
        self.enrollment.save()

        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(self.block_student_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.enrollment.refresh_from_db()
        self.assertEqual(self.enrollment.status, 'ENROLLED')
        self.assertIsNone(self.enrollment.block_reason)

class FeedbackAPIViewTest(APITestCase):

    def setUp(self):
        self.teacher = CustomUser.objects.create_user(
            email='teacher@example.com',
            password='testpassword',
            name='Teacher User',
            user_type='teacher'
        )
        self.student = CustomUser.objects.create_user(
            email='student@example.com',
            password='testpassword',
            name='Student User',
            user_type='student'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='This is a test course.',
            created_by=self.teacher
        )
        self.enrollment = Enrollment.objects.create(student=self.student, course=self.course)

        self.feedback_create_url = reverse('feedback-create')
        self.feedback_list_url = reverse('feedback-list')

    def test_student_can_create_feedback(self):
        """生徒がフィードバックを投稿できることを確認"""
        self.client.force_authenticate(user=self.student)
        data = {
            'enrollment_id': self.enrollment.id,
            'rating': 5,
            'comment': 'Excellent course!',
        }
        response = self.client.post(self.feedback_create_url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Feedback.objects.count(), 1)
        feedback = Feedback.objects.first()
        self.assertEqual(feedback.rating, 5)
        self.assertEqual(feedback.comment, 'Excellent course!')

    def test_teacher_cannot_create_feedback(self):
        """教師がフィードバックを投稿できないことを確認"""
        self.client.force_authenticate(user=self.teacher)
        data = {
            'enrollment_id': self.enrollment.id,
            'rating': 5,
            'comment': 'Not allowed.',
        }
        response = self.client.post(self.feedback_create_url, data)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Feedback.objects.count(), 0)

    def test_student_cannot_create_feedback_without_enrollment(self):
        """登録されていない生徒がフィードバックを投稿できないことを確認"""
        other_student = CustomUser.objects.create_user(
            email='other_student@example.com',
            password='testpassword',
            user_type='student'
        )
        self.client.force_authenticate(user=other_student)
        data = {
            'enrollment_id': self.enrollment.id,
            'rating': 5,
            'comment': 'Invalid attempt.',
        }
        response = self.client.post(self.feedback_create_url, data)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Feedback.objects.count(), 0)

    def test_get_feedback_list_as_teacher(self):
        """教師がフィードバック一覧を取得できることを確認"""
        Feedback.objects.create(
            enrollment=self.enrollment,
            rating=4,
            comment='Good course.'
        )

        self.client.force_authenticate(user=self.teacher)
        response = self.client.get(self.feedback_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['rating'], 4)
        self.assertEqual(response.data[0]['comment'], 'Good course.')

    def test_get_feedback_list_as_student(self):
        """生徒が自身のフィードバック一覧を取得できることを確認"""
        Feedback.objects.create(
            enrollment=self.enrollment,
            rating=4,
            comment='Good course.'
        )

        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.feedback_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['rating'], 4)
        self.assertEqual(response.data[0]['comment'], 'Good course.')

    def test_unauthorized_user_cannot_access_feedback(self):
        """認証されていないユーザーがフィードバックにアクセスできないことを確認"""
        response = self.client.get(self.feedback_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
