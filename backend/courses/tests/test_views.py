from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from accounts.models import CustomUser
from courses.models import Course, Module, File
import hashlib

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
