from rest_framework import permissions

class IsTeacher(permissions.BasePermission):
    """
    カスタムパーミッション: 教師のみがアクセス可能
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'teacher'
