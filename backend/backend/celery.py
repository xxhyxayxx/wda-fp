from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from django.apps import apps

# Djangoの設定モジュールを指定
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Celeryアプリケーションを作成
app = Celery('backend')

# Djangoのsettings.pyから設定をロード
app.config_from_object('django.conf:settings', namespace='CELERY')

# アプリ内のtasks.pyを自動検出
app.autodiscover_tasks(lambda: [n.name for n in apps.get_app_configs()])

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
