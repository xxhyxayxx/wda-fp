from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.utils.timezone import now

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    objects = CustomUserManager() 
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=50, default='New User')
    profile_image = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        default="https://res.cloudinary.com/dkmwoidaa/image/upload/v1736835004/profile_images/kaft7arwqbkxzdw2qerj.png"
    )
    user_type = models.CharField(
        max_length=10,
        choices=(
            ('student', 'Student'),
            ('teacher', 'Teacher'),
        ),
        default='student'
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

class Notification(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.URLField(blank=True, null=True)  # 必要ならリンクを設定
    event_type = models.CharField(max_length=50, default="general")  # イベントタイプ
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)  # 既読状態を管理

    def __str__(self):
        return f"{self.user.email} - {self.title}"

class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_messages'
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender} to {self.receiver} at {self.timestamp}"
