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


class FileCreateAPIView(generics.CreateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsTeacher]

    @transaction.atomic
    def perform_create(self, serializer):
        files = self.request.FILES.getlist('file')  # 複数のファイルを取得
        if not files:
            raise ValidationError("No files in request.FILES")

        module_id = self.request.data.get('module')
        user = self.request.user
        file_instances = []

        # 各ファイルごとにインスタンスを作成
        for file in files:
            file_data = {
                'file': file,
                'created_by': user,
                'module': module_id,
            }
            # シリアライザーを使って保存
            single_serializer = FileSerializer(data=file_data, context={'request': self.request})
            if single_serializer.is_valid():
                file_instance = single_serializer.save()
                file_instances.append(file_instance)
            else:
                raise ValidationError(single_serializer.errors)

        # シリアライズしたレスポンスデータを確認
        response_data = FileSerializer(file_instances, many=True, context={'request': self.request}).data
        print("Generated Response Data:", response_data)  # デバッグ用出力
        response_data = FileSerializer(file_instances, many=True, context={'request': self.request}).data
        print("JSON Response Data:", json.dumps(response_data, ensure_ascii=False, indent=2))

        # 成功したインスタンスのリストをレスポンスとして返す
        return Response(response_data, status=status.HTTP_201_CREATED)

def get_file_hash(file):
    """ファイルのハッシュ値を取得"""
    md5 = hashlib.md5()
    for chunk in file.chunks():
        md5.update(chunk)
    return md5.hexdigest()


# ファイル編集ビュー
class FileUpdateAPIView(generics.UpdateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsTeacher]

    @transaction.atomic
    def perform_update(self, serializer):
        files = self.request.FILES.getlist('file')
        if not files:
            raise ValidationError("No files provided for update")

        instance = serializer.instance
        existing_files = {f.pk: f for f in File.objects.filter(module=instance.module)}

        updated_files = []  # 新規または更新されたファイルを追跡するためのリスト

        # ユーザーを手動で設定
        user = self.request.user

        for file in files:
            file_hash = get_file_hash(file)  # アップロードされたファイルのハッシュ値を取得

            matching_file = None
            for f in existing_files.values():
                # 既存ファイルのハッシュ値と比較
                if get_file_hash(f.file) == file_hash:
                    matching_file = f
                    break

            if matching_file:
                # 既存ファイルの更新
                matching_file.file = file
                matching_file.save()
                updated_files.append(matching_file)
                print(f"Updated existing file: {file.name}")
            else:
                # 新規ファイルの追加
                new_file = File.objects.create(
                    file=file,
                    created_by=user,  # ユーザーを手動で設定
                    module=instance.module,
                )
                updated_files.append(new_file)
                print(f"Added new file: {file.name}")

        # デバッグ情報: モジュール内のファイル一覧
        print(f"Files after update in module {instance.module.id}: {[f.file.name for f in File.objects.filter(module=instance.module)]}")


class FileDeleteAPIView(generics.DestroyAPIView):
    queryset = File.objects.all()
    permission_classes = [IsTeacher]


class FileDeleteMultipleAPIView(APIView):
    permission_classes = [IsTeacher]

    @transaction.atomic
    def delete(self, request, *args, **kwargs):
        file_ids = request.data.get('file_ids', [])
        if not file_ids:
            raise ValidationError("file_ids is required for deletion")

        # デバッグ: 削除対象の file_ids を表示
        print(f"Attempting to delete files with IDs: {file_ids}")

        for file_id in file_ids:
            try:
                file_instance = File.objects.get(id=file_id)
                file_instance.delete()
                # デバッグ: 削除されたファイルIDを表示
                print(f"Deleted file with ID: {file_id}")
            except File.DoesNotExist:
                # デバッグ: 存在しないファイルIDを表示
                print(f"File with ID {file_id} does not exist, skipping")
                continue  # ファイルが存在しない場合はスキップ

        # 削除後の File テーブルの総数を表示して確認
        remaining_count = File.objects.count()
        print(f"Remaining file count after deletion: {remaining_count}")

        return Response(status=status.HTTP_204_NO_CONTENT)


# ファイルリストビュー
class FileListAPIView(generics.ListAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer