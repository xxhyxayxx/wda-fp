from rest_framework import serializers
from .models import Course, Module, File
from accounts.models import CustomUser  # CustomUserをインポート

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
        fields = ['id', 'course', 'course_title', 'title', 'description', 'order', 'files', 'created_by_name']
        read_only_fields = ['id', 'course_title', 'files', 'created_by_name', 'order']  # `order`を読み取り専用に追加

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class FileSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = File
        fields = ['id', 'module', 'module_title', 'file', 'title', 'uploaded_at', 'created_by_name']
        read_only_fields = ['id', 'module_title', 'uploaded_at', 'created_by_name']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
