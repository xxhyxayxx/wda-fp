from django.contrib import admin
from .models import Course

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_published', 'created_by', 'created_at', 'updated_at')
    list_filter = ('is_published', 'category', 'created_at', 'updated_at', 'created_by')
    search_fields = ('title', 'description', 'category', 'created_by__name')
    ordering = ('-created_at',)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('created_by')
