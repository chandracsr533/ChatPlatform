from django.urls import path

from .views import (
    RegisterView,
    ProfileView,
    UsersListView,
    MessageListCreateView,
    GroupListCreateView,
    GroupMessageListCreateView,
    NotificationListView,
    MarkAllNotificationsReadView,
    OnlineStatusView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [

    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="login"
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),

    path(
        "users/",
        UsersListView.as_view(),
        name="users"
    ),

    path(
        "messages/",
        MessageListCreateView.as_view(),
        name="messages"
    ),

    # Group Chat APIs
    path(
        "groups/",
        GroupListCreateView.as_view(),
        name="groups"
    ),

    path(
        "groups/<int:group_id>/messages/",
        GroupMessageListCreateView.as_view(),
        name="group_messages"
    ),

        # Notification API
    path(
        "notifications/",
        NotificationListView.as_view(),
        name="notifications"
    ),

    path(
    "notifications/mark-all-read/",
    MarkAllNotificationsReadView.as_view(),
    name="mark_all_notifications_read"
),
path(
    "status/",
    OnlineStatusView.as_view(),
    name="online-status"
),
]