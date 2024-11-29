from rest_framework import generics, permissions, status
from .models import Course, Module, File
from .serializers import CourseSerializer, ModuleSerializer, FileSerializer
from .permissions import IsTeacher
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from rest_framework.exceptions import ValidationError
import hashlib
import json


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
    
def get_file_hash(file):
    """ファイルのハッシュ値を取得"""
    md5 = hashlib.md5()
    for chunk in file.chunks():
        md5.update(chunk)
    return md5.hexdigest()

class FileBatchUpdateAPIView(APIView):
    permission_classes = [IsTeacher]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        # リクエストからファイルと削除対象IDの取得
        files_to_create = request.FILES.getlist('files_to_create')
        files_to_update = request.FILES.getlist('files_to_update')
        files_to_update_ids = request.data.getlist('files_to_update_ids', [])

        # files_to_deleteをリスト形式で取得
        files_to_delete = request.data.getlist('files_to_delete')
        
        # モジュールIDやユーザー情報の取得
        module_id = request.data.get('module')
        user = request.user

        created_files, updated_files, deleted_files = [], [], []

        # 1. 新規ファイルの作成
        for file in files_to_create:
            file_data = {'file': file, 'created_by': user, 'module': module_id}
            serializer = FileSerializer(data=file_data, context={'request': request})
            if serializer.is_valid():
                created_file = serializer.save()
                created_files.append(created_file)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # 2. 既存ファイルの更新（内容が異なる場合のみ）
        for file_id, update_file in zip(files_to_update_ids, files_to_update):
            try:
                existing_file = File.objects.get(id=file_id, module=module_id)
                
                # 既存ファイルと新しいファイルのハッシュを比較
                existing_file_hash = get_file_hash(existing_file.file)
                new_file_hash = get_file_hash(update_file)

                if existing_file_hash != new_file_hash:
                    # 内容が異なる場合のみファイルを更新
                    existing_file.file = update_file
                    existing_file.save()
                    updated_files.append(existing_file)
                    print(f"Updated existing file: {update_file.name}")
                else:
                    print(f"File {update_file.name} is identical to the existing file. No update performed.")

            except File.DoesNotExist:
                return Response({"error": f"File with id {file_id} does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # 3. ファイルの削除
        print("Deleting files with IDs:", files_to_delete)  # デバッグ用
        File.objects.filter(id__in=files_to_delete, module=module_id).delete()
        deleted_files = files_to_delete

        # レスポンスデータの作成
        response_data = {
            "created": FileSerializer(created_files, many=True, context={'request': request}).data,
            "updated": FileSerializer(updated_files, many=True, context={'request': request}).data,
            "deleted": deleted_files,
        }

        return Response(response_data, status=status.HTTP_200_OK)

# ファイルリストビュー
class FileListAPIView(generics.ListAPIView):
    serializer_class = FileSerializer

    def get_queryset(self):
        module_id = self.request.query_params.get('module')
        if module_id:
            return File.objects.filter(module_id=module_id)
        return File.objects.all()
