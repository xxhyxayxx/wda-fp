from django.urls import path
from .views import UserRegistrationAPIView, UserProfileUpdateAPIView, LogoutAPIView, ChangePasswordAPIView, NotificationListAPIView, AdminBulkNotificationAPIView, MarkNotificationAsReadAPIView, ReleaseNewCourseAPIView, UserSearchAPIView, UserDetailAPIView, MessageListAPIView, SendMessageAPIView, MarkMessageAsReadAPIView, ConversationListAPIView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('register/', UserRegistrationAPIView.as_view(), name='user-register'),
    path('profile/update/', UserProfileUpdateAPIView.as_view(), name='user-profile-update'),
    path('login/', obtain_auth_token, name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
    path('notifications/', NotificationListAPIView.as_view(), name='notification-list'),  # 通知一覧エンドポイント
    path('notifications/admin-bulk/', AdminBulkNotificationAPIView.as_view(), name='admin-bulk-notify'),
    path('notifications/<int:notification_id>/mark-as-read/', MarkNotificationAsReadAPIView.as_view(), name='notification-mark-as-read'),
    path('courses/release/', ReleaseNewCourseAPIView.as_view(), name='release-new-course'),
    path('search/', UserSearchAPIView.as_view(), name='user-search'),
    path('users/<int:id>/', UserDetailAPIView.as_view(), name='user-detail'),
    path('messages/', MessageListAPIView.as_view(), name='message-list'),
    path('messages/send/', SendMessageAPIView.as_view(), name='message-send'),
    path('messages/<int:message_id>/mark-as-read/', MarkMessageAsReadAPIView.as_view(), name='message-mark-as-read'),
    path('conversations/', ConversationListAPIView.as_view(), name='conversation-list'),
]
