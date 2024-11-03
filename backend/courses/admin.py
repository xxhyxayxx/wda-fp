from django.contrib import admin
from .models import Course, Module, File

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_published', 'created_by', 'created_at', 'updated_at')
    list_filter = ('is_published', 'category', 'created_at', 'updated_at', 'created_by')
    search_fields = ('title', 'description', 'category', 'created_by__name')
    ordering = ('-created_at',)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('created_by')

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course')  # 'order' を削除
    search_fields = ('title', 'course__title')
    list_filter = ('course',)

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'uploaded_at')
    search_fields = ('title', 'module__title')
    list_filter = ('module',)
