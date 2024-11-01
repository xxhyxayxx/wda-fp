from django.urls import path
from .views import CourseCreateAPIView, CourseUpdateAPIView, CourseDeleteAPIView, CourseListAPIView

urlpatterns = [
    path('', CourseListAPIView.as_view(), name='course-list'),  # リスト表示の追加
    path('create/', CourseCreateAPIView.as_view(), name='course-create'),
    path('<int:pk>/update/', CourseUpdateAPIView.as_view(), name='course-update'),
    path('<int:pk>/delete/', CourseDeleteAPIView.as_view(), name='course-delete'),
]
