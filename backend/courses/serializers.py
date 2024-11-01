from rest_framework import serializers
from .models import Course
from accounts.models import CustomUser  # CustomUserをインポート

class CourseSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'is_published', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by_name', 'created_at', 'updated_at']

    def create(self, validated_data):
        # 作成者をリクエストユーザーに設定
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
