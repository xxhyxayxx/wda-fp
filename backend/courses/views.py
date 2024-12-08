from rest_framework import generics, permissions, status
from .models import Course, Module, File, Module, ModuleProgress, Enrollment, Feedback
from .serializers import CourseSerializer, ModuleSerializer, FileSerializer, ModuleProgressSerializer, EnrollmentSerializer, FeedbackSerializer
from .permissions import IsTeacher
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from rest_framework.exceptions import ValidationError
import hashlib
import json
from django.utils.timezone import now
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from django.core.exceptions import PermissionDenied

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

class EnrollmentView(APIView):
    """
    生徒がコースに登録するビュー
    """
    def post(self, request, course_id):
        # 指定されたコースを取得
        course = get_object_or_404(Course, id=course_id)
        student = request.user

        # ユーザーが生徒であるか確認
        if student.user_type != 'student':
            return Response({'error': 'Only students can enroll in courses'}, status=status.HTTP_403_FORBIDDEN)

        # 既に登録済みかを確認
        if Enrollment.objects.filter(student=student, course=course).exists():
            return Response({'error': 'You are already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)

        # Enrollmentを作成
        enrollment = Enrollment.objects.create(student=student, course=course)
        serializer = EnrollmentSerializer(enrollment)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CompleteModuleView(APIView):
    def post(self, request, module_id):
        module = get_object_or_404(Module, id=module_id)
        enrollment = get_object_or_404(Enrollment, student=request.user, course=module.course)

        progress, created = ModuleProgress.objects.get_or_create(
            enrollment=enrollment,
            module=module
        )
        progress.is_completed = True
        progress.completed_at = now()
        progress.save()

        # コース全体の進捗率を更新
        modules = Module.objects.filter(course=module.course)
        module_progresses = ModuleProgress.objects.filter(enrollment=enrollment)
        total_modules = modules.count()
        completed_modules = module_progresses.filter(is_completed=True).count()
        enrollment.progress = Decimal((completed_modules / total_modules) * 100) if total_modules > 0 else Decimal('0.00')
        enrollment.save()

        serializer = ModuleProgressSerializer(progress)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CourseProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        # 教師の場合は403を返す
        if request.user.user_type == 'teacher':
            return Response({'error': 'Teachers cannot access course progress'}, status=status.HTTP_403_FORBIDDEN)

        # コース登録データを取得
        enrollment = get_object_or_404(Enrollment, student=request.user, course_id=course_id)
        modules = Module.objects.filter(course_id=course_id)
        module_progresses = ModuleProgress.objects.filter(enrollment=enrollment)

        # モジュール進捗の計算
        total_modules = modules.count()
        completed_modules = module_progresses.filter(is_completed=True).count()
        progress = Decimal((completed_modules / total_modules) * 100) if total_modules > 0 else Decimal('0.00')

        # 進捗率を更新
        enrollment.progress = progress
        enrollment.save()

        # モジュール進捗データを取得
        progress_data = ModuleProgressSerializer(module_progresses, many=True).data

        return Response({
            'course_progress': float(progress),  # float型に変換して返す
            'module_progress': progress_data
        })

class EnrolledCoursesAPIView(APIView):
    """
    現在のユーザーが登録済みのコース一覧を取得するビュー
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # ユーザーが生徒であるか確認
        if request.user.user_type != 'student':
            return Response({'error': 'Only students can access this view'}, status=status.HTTP_403_FORBIDDEN)

        # ログイン中の生徒の登録情報を取得
        enrollments = Enrollment.objects.filter(student=request.user)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

class CourseStudentsAPIView(APIView):
    """
    指定されたコースに登録されている生徒の情報を取得するビュー
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        # コースの存在を確認
        course = get_object_or_404(Course, id=course_id)

        # コースに登録されている生徒を取得
        enrollments = Enrollment.objects.filter(course=course)

        # 生徒のプロフィールデータとステータスをシリアライズ
        student_data = [
            {
                'id': enrollment.student.id,
                'name': enrollment.student.name,
                'email': enrollment.student.email,
                'profile_image': request.build_absolute_uri(enrollment.student.profile_image.url)
                if enrollment.student.profile_image else None,
                'status': enrollment.status,  # ステータスを追加
                'block_reason': enrollment.block_reason,  # ブロック理由を追加（必要なら）
            }
            for enrollment in enrollments
        ]

        return Response(student_data, status=status.HTTP_200_OK)

class BlockStudentAPIView(APIView):
    """
    生徒をブロックまたはアンブロックするAPI
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, student_id):
        # 現在のユーザーが教師であることを確認
        if request.user.user_type != 'teacher':
            return Response({'error': 'Only teachers can block or unblock students.'}, status=status.HTTP_403_FORBIDDEN)

        # コースと生徒の登録データを取得
        enrollment = get_object_or_404(Enrollment, course_id=course_id, student_id=student_id)

        # ブロック状態のトグル
        if enrollment.status == 'BLOCKED':
            # ブロック解除
            enrollment.status = 'ENROLLED'
            enrollment.block_reason = None  # 理由をクリア
            message = 'Student unblocked successfully.'
        else:
            # ブロック
            enrollment.status = 'BLOCKED'
            enrollment.block_reason = request.data.get('reason', 'No reason provided')  # 理由を設定
            message = 'Student blocked successfully.'

        enrollment.save()

        return Response({
            'message': message,
            'status': enrollment.status,
            'block_reason': enrollment.block_reason
        }, status=status.HTTP_200_OK)

class FeedbackCreateAPIView(generics.CreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # ユーザーが生徒であることを確認
        if self.request.user.user_type != 'student':
            raise PermissionDenied("Only students can submit feedback.")

        # Enrollment が現在の生徒に紐付いているか確認
        enrollment_id = self.request.data.get('enrollment_id')
        enrollment = get_object_or_404(Enrollment, id=enrollment_id, student=self.request.user)

        # フィードバックを保存
        serializer.save(enrollment=enrollment)


class FeedbackListAPIView(generics.ListAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # ユーザーが教師の場合は、自分のコースに関するフィードバックを返す
        if self.request.user.user_type == 'teacher':
            return Feedback.objects.filter(enrollment__course__created_by=self.request.user)
        
        # ユーザーが生徒の場合は、自分が登録したコースのフィードバックを返す
        return Feedback.objects.filter(enrollment__student=self.request.user)
