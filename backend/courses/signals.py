from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Course
from accounts.tasks import generate_notification

@receiver(post_save, sender=Course)
def send_course_creation_notification(sender, instance, created, **kwargs):
    if created:  # 新規作成時のみ実行
        generate_notification.delay(
            event_type="course_release",
            title="New Course Released",
            message=f"The course '{instance.title}' has just been released!",
            link=f"/courses/{instance.id}/"
        )
