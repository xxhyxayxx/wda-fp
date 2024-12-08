from django.urls import path
from .views import (
    CourseCreateAPIView, CourseUpdateAPIView, CourseDeleteAPIView, CourseListAPIView,
    ModuleCreateAPIView, ModuleUpdateAPIView, ModuleDeleteAPIView, ModuleListAPIView,
    FileListAPIView, FileBatchUpdateAPIView, EnrollmentView, CompleteModuleView,
    EnrolledCoursesAPIView, CourseProgressView, CourseStudentsAPIView, BlockStudentAPIView, FeedbackCreateAPIView, FeedbackListAPIView  # Import the new view
)

urlpatterns = [
    # コースエンドポイント
    path('', CourseListAPIView.as_view(), name='course-list'),  # コース一覧
    path('create/', CourseCreateAPIView.as_view(), name='course-create'),
    path('<int:pk>/update/', CourseUpdateAPIView.as_view(), name='course-update'),
    path('<int:pk>/delete/', CourseDeleteAPIView.as_view(), name='course-delete'),
    
    # モジュールエンドポイント
    path('modules/', ModuleListAPIView.as_view(), name='module-list'),  # モジュール一覧
    path('modules/create/', ModuleCreateAPIView.as_view(), name='module-create'),
    path('modules/<int:pk>/update/', ModuleUpdateAPIView.as_view(), name='module-update'),
    path('modules/<int:pk>/delete/', ModuleDeleteAPIView.as_view(), name='module-delete'),
    
    # ファイルエンドポイント
    path('files/', FileListAPIView.as_view(), name='file-list'),  # ファイル一覧
    path('files/batch-update/', FileBatchUpdateAPIView.as_view(), name='file-batch-update'),  # ファイルの一括作成・更新・削除
    
    # Enrollment API
    path('<int:course_id>/enroll/', EnrollmentView.as_view(), name='course-enroll'),  # コース登録
    path('enrollments/', EnrolledCoursesAPIView.as_view(), name='enrollment-list'),

    # Module Completion API
    path('modules/<int:module_id>/complete/', CompleteModuleView.as_view(), name='module-complete'),  # モジュール完了
    path('courses/<int:course_id>/progress/', CourseProgressView.as_view(), name='course-progress'),

    # Course Students API
    path('<int:course_id>/students/', CourseStudentsAPIView.as_view(), name='course-students'),  # コース参加学生一覧
    
    path('<int:course_id>/students/<int:student_id>/block/', BlockStudentAPIView.as_view(), name='block-student'),
    
    # Feedback API
    path('feedback/', FeedbackListAPIView.as_view(), name='feedback-list'),  # フィードバック一覧
    path('feedback/create/', FeedbackCreateAPIView.as_view(), name='feedback-create'),  # フィードバック作成
]
