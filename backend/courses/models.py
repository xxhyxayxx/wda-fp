from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import os
from django.utils import timezone

User = get_user_model()

class Course(models.Model):
    title = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    is_published = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} by {self.created_by.name} at {self.created_at}"

class Module(models.Model):
    course = models.ForeignKey(Course, related_name='modules', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_modules')

    def __str__(self):
        return f"{self.course.title} - {self.title}"

def validate_file_type(value):
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.doc', '.docx', '.ppt', '.pptx']
    if ext not in valid_extensions:
        raise ValidationError(f"Unsupported file extension: {ext}. Allowed extensions are: {', '.join(valid_extensions)}")

class File(models.Model):
    module = models.ForeignKey(Module, related_name='files', on_delete=models.CASCADE)
    file = models.FileField(upload_to='course_files/', validators=[validate_file_type])
    uploaded_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_files')  # 作成者を追加

    def __str__(self):
        return os.path.basename(self.file.name)  # ファイル名をそのまま返す

# Enrollment Model
class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('ENROLLED', 'Enrolled'),
        ('BLOCKED', 'Blocked'),
        ('COMPLETED', 'Completed'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'}, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ENROLLED')
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # 0.00 - 100.00%
    block_reason = models.TextField(blank=True, null=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.name} - {self.course.title} ({self.status})"

# ModuleProgress Model
class ModuleProgress(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='module_progresses')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('enrollment', 'module')

    def __str__(self):
        return f"{self.enrollment.student.name} - {self.module.title} ({'Completed' if self.is_completed else 'In Progress'})"

    def save(self, *args, **kwargs):
        if self.is_completed and not self.completed_at:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)