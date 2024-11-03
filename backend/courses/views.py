from rest_framework import generics, permissions, status
from .models import Course, Module, File
from .serializers import CourseSerializer, ModuleSerializer, FileSerializer
from .permissions import IsTeacher
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction

# コース作成、更新、削除、一覧ビュー

class CourseCreateAPIView(generics.CreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsTeacher]

class CourseUpdateAPIView(generics.UpdateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsTeacher]

class CourseDeleteAPIView(generics.DestroyAPIView):
    queryset = Course.objects.all()
    permission_classes = [IsTeacher]

class CourseListAPIView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

# モジュール作成ビュー
class ModuleCreateAPIView(generics.CreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsTeacher]

# モジュール編集ビュー
class ModuleUpdateAPIView(generics.UpdateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsTeacher]

# モジュール削除ビュー
class ModuleDeleteAPIView(generics.DestroyAPIView):
    queryset = Module.objects.all()
    permission_classes = [IsTeacher]

# モジュールリストビュー
class ModuleListAPIView(generics.ListAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

# ファイル作成ビュー
class FileCreateAPIView(generics.CreateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsTeacher]

# ファイル編集ビュー
class FileUpdateAPIView(generics.UpdateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsTeacher]

# ファイル削除ビュー
class FileDeleteAPIView(generics.DestroyAPIView):
    queryset = File.objects.all()
    permission_classes = [IsTeacher]

# ファイルリストビュー
class FileListAPIView(generics.ListAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
