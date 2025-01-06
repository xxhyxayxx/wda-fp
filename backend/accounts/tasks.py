from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@shared_task
def save_notification(user_id, title, message, link=None, event_type="general"):
    """
    特定のユーザーに通知を作成します。
    :param user_id: 対象ユーザーのID
    :param title: 通知タイトル
    :param message: 通知メッセージ
    :param link: 通知リンク (オプション)
    :param event_type: 通知の種類 (例: "general", "important_announcement")
    """
    # 遅延インポート
    from .models import Notification, CustomUser

    try:
        user = CustomUser.objects.get(id=user_id)
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            link=link,
            event_type=event_type,
        )
        return f"Notification created for user {user_id}."
    except CustomUser.DoesNotExist:
        return f"User with ID {user_id} does not exist."

@shared_task
def generate_notification(event_type, title, message, link=None, user_ids=None):
    from .models import Notification, CustomUser

    if user_ids:
        users = CustomUser.objects.filter(id__in=user_ids)
    else:
        users = CustomUser.objects.all()

    notifications = []
    channel_layer = get_channel_layer()

    for user in users:
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            link=link,
            event_type=event_type,
        )
        notifications.append(notification)

        # WebSocketでリアルタイム通知を送信
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}",
            {
                "type": "send_notification",
                "notification": {
                    "title": title,
                    "message": message,
                    "link": link,
                    "event_type": event_type,
                },
            }
        )

    return f"Notifications created for {len(users)} users."
