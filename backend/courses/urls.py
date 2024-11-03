from django.urls import path
from .views import (
    CourseCreateAPIView, CourseUpdateAPIView, CourseDeleteAPIView, CourseListAPIView,
    ModuleCreateAPIView, ModuleUpdateAPIView, ModuleDeleteAPIView, ModuleListAPIView,
    FileCreateAPIView, FileUpdateAPIView, FileDeleteAPIView, FileListAPIView
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
    path('files/create/', FileCreateAPIView.as_view(), name='file-create'),
    path('files/<int:pk>/update/', FileUpdateAPIView.as_view(), name='file-update'),
    path('files/<int:pk>/delete/', FileDeleteAPIView.as_view(), name='file-delete'),
]
