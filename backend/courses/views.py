from rest_framework import generics, permissions, status
from .models import Course, Module, File
from .serializers import CourseSerializer, ModuleSerializer, FileSerializer
from .permissions import IsTeacher
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction

# コース作成、更新、削除、一覧ビュー（既存コード）

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

class ModuleOrderUpdateAPIView(APIView):
    permission_classes = [IsTeacher]

    def patch(self, request, *args, **kwargs):
        modules_order = request.data.get("modules_order")

        # modules_orderがリストかどうかチェック
        if not isinstance(modules_order, list):
            return Response(
                {"error": "Invalid data format. Expected a list of module IDs."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # リクエストされたIDが存在するかチェック
        module_ids = [module.id for module in Module.objects.all()]
        invalid_ids = [module_id for module_id in modules_order if module_id not in module_ids]
        if invalid_ids:
            return Response(
                {"error": f"Invalid module IDs: {invalid_ids}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # トランザクション内で順序を更新
        with transaction.atomic():
            for order, module_id in enumerate(modules_order, start=1):
                Module.objects.filter(id=module_id).update(order=order)

        return Response({"message": "Module order updated successfully"}, status=status.HTTP_200_OK)

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
