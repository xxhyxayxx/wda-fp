from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from accounts.models import CustomUser
from courses.models import Course, Module, File


class CourseViewTest(APITestCase):

    def setUp(self):
        # テスト用のユーザー（教師と学生）を作成
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

        # コースのテストデータ
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
        # まず、コースを作成
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
        # テスト用のユーザー（教師と学生）を作成
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
        
        # テスト用のコースを作成
        self.course = Course.objects.create(
            title='Test Course',
            description='This is a test course.',
            category='Test Category',
            is_published=True,
            created_by=self.teacher
        )
        
        # モジュール作成用データ
        self.module_data = {
            'course': self.course.pk,
            'title': 'Test Module',
            'description': 'This is a test module.',
            'order': 1,
        }

        self.create_url = reverse('module-create')
        self.update_url = lambda pk: reverse('module-update', args=[pk])
        self.delete_url = lambda pk: reverse('module-delete', args=[pk])
        self.order_update_url = reverse('module-order-update')  # ModuleOrderUpdateAPIViewへのURLを定義

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
            order=self.module_data['order'],
            created_by=self.teacher
        )
        updated_data = {
            'title': 'Updated Module Title',
            'description': 'Updated description.',
            'order': 2,
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
            order=self.module_data['order'],
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
            order=self.module_data['order'],
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
            order=self.module_data['order'],
            created_by=self.teacher
        )

        self.client.force_authenticate(user=self.student)
        response = self.client.delete(self.delete_url(module.pk))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_update_module_order(self):
        # モジュールを複数作成して初期順序を確認
        module1 = Module.objects.create(course=self.course, title="Module 1", order=1, created_by=self.teacher)
        module2 = Module.objects.create(course=self.course, title="Module 2", order=2, created_by=self.teacher)
        module3 = Module.objects.create(course=self.course, title="Module 3", order=3, created_by=self.teacher)

        # 更新リクエストのデータ
        new_order = [module3.id, module1.id, module2.id]  # 新しい順序

        # 認証とPATCHリクエスト
        self.client.force_authenticate(user=self.teacher)
        response = self.client.patch(self.order_update_url, {"modules_order": new_order}, format='json')

        # ステータスコードと順序の確認
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        module1.refresh_from_db()
        module2.refresh_from_db()
        module3.refresh_from_db()
        self.assertEqual(module1.order, 2)
        self.assertEqual(module2.order, 3)
        self.assertEqual(module3.order, 1)

    def test_student_cannot_update_module_order(self):
        # 学生で認証
        self.client.force_authenticate(user=self.student)
        response = self.client.patch(self.order_update_url, {"modules_order": [1, 2]}, format='json')

        # 権限エラーの確認
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
            order=1,
            created_by=self.teacher
        )
        self.test_file = SimpleUploadedFile("test_file.pdf", b"file_content", content_type="application/pdf")
        self.file_data = {
            'module': self.module.pk,
            'file': self.test_file,
            'title': 'Test File',
        }

        self.create_url = reverse('file-create')
        self.update_url = lambda pk: reverse('file-update', args=[pk])
        self.delete_url = lambda pk: reverse('file-delete', args=[pk])

    def test_teacher_can_create_file(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(self.create_url, self.file_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(File.objects.count(), 1)
        self.assertEqual(File.objects.first().title, 'Test File')

    def test_student_cannot_create_file(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.create_url, self.file_data)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_update_file(self):
        file = File.objects.create(module=self.module, file=self.test_file, title='Original File', created_by=self.teacher)
        
        # 新しいファイルオブジェクトを作成して更新データに渡す
        updated_file = SimpleUploadedFile("updated_test_file.pdf", b"updated file content", content_type="application/pdf")
        updated_data = {
            'title': 'Updated File Title',
            'module': self.module.pk,
            'file': updated_file,  # 新しいファイルオブジェクト
        }

        self.client.force_authenticate(user=self.teacher)
        response = self.client.put(self.update_url(file.pk), updated_data)

        self.assertEqual(response.status_code, status.HTTP_200_OK, msg=response.data)
        file.refresh_from_db()
        self.assertEqual(file.title, 'Updated File Title')

    def test_student_cannot_update_file(self):
        file = File.objects.create(module=self.module, file=self.test_file, title='Student Test File', created_by=self.teacher)

        self.client.force_authenticate(user=self.student)
        response = self.client.put(self.update_url(file.pk), self.file_data)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_delete_file(self):
        file = File.objects.create(module=self.module, file=self.test_file, title='Deletable File', created_by=self.teacher)

        self.client.force_authenticate(user=self.teacher)
        response = self.client.delete(self.delete_url(file.pk))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(File.objects.count(), 0)

    def test_student_cannot_delete_file(self):
        file = File.objects.create(module=self.module, file=self.test_file, title='Protected File', created_by=self.teacher)

        self.client.force_authenticate(user=self.student)
        response = self.client.delete(self.delete_url(file.pk))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
