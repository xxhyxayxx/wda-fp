from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from accounts.models import CustomUser
from courses.models import Course

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
