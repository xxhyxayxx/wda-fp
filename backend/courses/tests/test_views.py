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

class FileViewTest(APITestCase):

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
        # 複数ファイル用にセットアップ
        self.test_file_1 = SimpleUploadedFile("test_file_1.pdf", b"file_content_1", content_type="application/pdf")
        self.test_file_2 = SimpleUploadedFile("test_file_2.pdf", b"file_content_2", content_type="application/pdf")
        self.files_data = {
            'module': self.module.pk,
            'file': [self.test_file_1, self.test_file_2],
        }

        self.create_url = reverse('file-create')
        self.update_url = lambda pk: reverse('file-update', args=[pk])
        self.delete_url = lambda pk: reverse('file-delete', args=[pk])
        self.delete_multiple_url = reverse('file-delete-multiple')

    def test_teacher_can_create_multiple_files(self):
        self.client.force_authenticate(user=self.teacher)
        
        response = self.client.post(self.create_url, {
            'module': self.module.pk,
            'file': [self.test_file_1, self.test_file_2],
        }, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(File.objects.count(), 2)  # 2つのファイルが保存される

        # ユニークなIDを使って確認
        file_1 = File.objects.first()
        file_2 = File.objects.last()

        self.assertIsNotNone(file_1.id)  # IDが設定されているか確認
        self.assertIsNotNone(file_2.id)  # IDが設定されているか確認

        # ファイルフィールドがnullでないことを確認
        self.assertIsNotNone(file_1.file)
        self.assertGreater(len(file_1.file.name), 0)  # ファイル名が空でないことも確認
        self.assertIsNotNone(file_2.file)
        self.assertGreater(len(file_2.file.name), 0)

    def test_student_cannot_create_multiple_files(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.create_url, {
            'module': self.module.pk,
            'file': [self.test_file_1, self.test_file_2],
        }, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_update_multiple_files(self):
        file_1 = File.objects.create(module=self.module, file=self.test_file_1, created_by=self.teacher)
        file_2 = File.objects.create(module=self.module, file=self.test_file_2, created_by=self.teacher)

        updated_file_1 = SimpleUploadedFile("updated_test_file_1.pdf", b"updated file content 1", content_type="application/pdf")
        new_file = SimpleUploadedFile("new_test_file.pdf", b"new file content", content_type="application/pdf")

        updated_data = {
            'module': self.module.pk,
            'file': [updated_file_1, new_file],  # file_1を更新し、新規ファイルも追加
        }

        self.client.force_authenticate(user=self.teacher)
        response = self.client.put(self.update_url(file_1.pk), updated_data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        updated_files = File.objects.filter(module=self.module)
        print(f"Files after update in DB: {[f.file.name for f in updated_files]}")  # ファイル名の確認

        self.assertEqual(updated_files.count(), 4)  # 更新後のファイル数を再確認

    def test_student_cannot_update_multiple_files(self):
        file_1 = File.objects.create(module=self.module, file=self.test_file_1, created_by=self.teacher)
        file_2 = File.objects.create(module=self.module, file=self.test_file_2, created_by=self.teacher)

        updated_file_1 = SimpleUploadedFile("updated_test_file_1.pdf", b"updated file content 1", content_type="application/pdf")
        updated_file_2 = SimpleUploadedFile("updated_test_file_2.pdf", b"updated file content 2", content_type="application/pdf")

        updated_data = {
            'module': self.module.pk,
            'file': [updated_file_1, updated_file_2],
        }

        self.client.force_authenticate(user=self.student)
        response = self.client.put(self.update_url(file_1.pk), updated_data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_delete_multiple_files(self):
        file_1 = File.objects.create(module=self.module, file=self.test_file_1, created_by=self.teacher)
        file_2 = File.objects.create(module=self.module, file=self.test_file_2, created_by=self.teacher)

        self.client.force_authenticate(user=self.teacher)
        response = self.client.delete(self.delete_multiple_url, data={'file_ids': [file_1.pk, file_2.pk]}, format='json')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(File.objects.count(), 0)  # 2ファイルが削除される

    def test_student_cannot_delete_multiple_files(self):
        file_1 = File.objects.create(module=self.module, file=self.test_file_1, created_by=self.teacher)
        file_2 = File.objects.create(module=self.module, file=self.test_file_2, created_by=self.teacher)

        self.client.force_authenticate(user=self.student)
        response = self.client.delete(self.delete_multiple_url, data={'file_ids': [file_1.pk, file_2.pk]}, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
