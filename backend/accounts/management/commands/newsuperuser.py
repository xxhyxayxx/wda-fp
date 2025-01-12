import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser automatically if it does not exist'

    def handle(self, *args, **kwargs):
        # 環境変数からスーパーユーザーの情報を取得
        email = os.getenv('SUPERUSER_EMAIL')
        password = os.getenv('SUPERUSER_PASSWORD')
        name = os.getenv('SUPERUSER_NAME', 'Admin')

        # 必要な環境変数が設定されているか確認
        if not email or not password:
            self.stdout.write(self.style.ERROR('SUPERUSER_EMAIL and SUPERUSER_PASSWORD must be set in the environment variables.'))
            return

        # スーパーユーザーが存在しない場合は作成
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(email=email, password=password, name=name)
            self.stdout.write(self.style.SUCCESS(f'Successfully created superuser with email: {email}'))
        else:
            self.stdout.write(self.style.WARNING(f'Superuser with email {email} already exists.'))
