from celery import shared_task

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
    """
    特定のイベントに基づいて通知を生成。
    :param event_type: 通知の種類 (例: "course_release")
    :param title: 通知タイトル
    :param message: 通知メッセージ
    :param link: 通知リンク (オプション)
    :param user_ids: 対象ユーザーのIDリスト (Noneの場合は全ユーザー)
    """
    # 遅延インポートを使用して循環参照を防ぐ
    from .models import Notification, CustomUser

    # ユーザーをフィルタリング
    if user_ids:
        users = CustomUser.objects.filter(id__in=user_ids)
    else:
        users = CustomUser.objects.all()

    # 通知を作成
    for user in users:
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            link=link,
            event_type=event_type,
        )
    return f"Notifications created for {len(users)} users."
