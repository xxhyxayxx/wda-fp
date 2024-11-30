from rest_framework import serializers
from .models import Course, Module, File, Enrollment, ModuleProgress
from accounts.models import CustomUser  # CustomUserをインポート
from rest_framework.exceptions import ValidationError

class CourseSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    modules = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'is_published', 'created_by_name', 'modules', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by_name', 'modules', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ModuleSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    files = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'course', 'course_title', 'title', 'description', 'files', 'created_by_name']
        read_only_fields = ['id', 'course_title', 'files', 'created_by_name']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class FileSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    file = serializers.FileField(use_url=True)

    class Meta:
        model = File
        fields = ['id', 'module', 'module_title', 'file', 'uploaded_at', 'created_by_name']
        read_only_fields = ['id', 'module_title', 'uploaded_at', 'created_by_name']

    def create(self, validated_data):
        print(f"Validated data in create: {validated_data}")  # validated_dataにfileが含まれているかを確認
        if 'file' not in validated_data:
            raise ValidationError("File is missing in the request")
        
        validated_data['created_by'] = self.context['request'].user
        instance = super().create(validated_data)
        print(f"File saved: {instance.file.name}")  # 保存されたファイル名を確認
        return instance

    @classmethod
    def create_multiple(cls, validated_data_list, request=None):
        files = []
        for validated_data in validated_data_list:
            print(f"Validated data in create_multiple: {validated_data}")
            
            # requestからuser情報を設定
            validated_data['created_by'] = request.user if request else None

            file_data = {
                'file': validated_data['file'],
                'created_by': validated_data['created_by'],
                'module': validated_data['module'],
            }
            # シリアライザーのインスタンスを作成してバリデーションを行う
            file_serializer = cls(data=file_data, context={'request': request})
            if file_serializer.is_valid():
                file_instance = file_serializer.save()
                files.append(file_instance)
            else:
                print(f"Validation error for file {validated_data['file'].name}: {file_serializer.errors}")
                raise ValidationError(f"File validation failed for {validated_data['file'].name}")

        return files
    
    @classmethod
    def update_multiple(cls, instance_list, validated_data_list, request=None):
        files = []
        for instance, validated_data in zip(instance_list, validated_data_list):
            validated_data['created_by'] = request.user if request else None
            # 更新データを使用してインスタンスを更新
            file_serializer = cls(instance=instance, data=validated_data, context={'request': request}, partial=True)
            if file_serializer.is_valid():
                file_instance = file_serializer.save()
                files.append(file_instance)
            else:
                print(f"Validation error for file {validated_data['file'].name}: {file_serializer.errors}")
                raise ValidationError(f"File update validation failed for {validated_data['file'].name}")

        return files

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'status', 'progress', 'block_reason', 'enrolled_at', 'completed_at']

class ModuleProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleProgress
        fields = ['id', 'enrollment', 'module', 'is_completed', 'completed_at']
