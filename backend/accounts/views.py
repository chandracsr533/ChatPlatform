from django.utils import timezone

from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth.models import User
from django.db.models import Q

from .models import (
    UserProfile,
    Message,
    Group,
    GroupMessage,
    Notification,
)

from .serializers import (
    RegisterSerializer,
    MessageSerializer,
    GroupSerializer,
    GroupMessageSerializer,
    ProfileSerializer,
)

class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]




class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        profile, created = UserProfile.objects.get_or_create(
            user=request.user
        )

        serializer = ProfileSerializer(
    profile,
    context={"request": request}
)

        return Response(serializer.data)

    def put(self, request):

        profile, created = UserProfile.objects.get_or_create(
            user=request.user
        )

        serializer = ProfileSerializer(
    profile,
    data=request.data,
    context={"request": request}
)

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=400
        )

    def patch(self, request):

        profile, created = UserProfile.objects.get_or_create(
            user=request.user
        )

        serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=400
        )
class OnlineStatusView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request):

        profile, created = UserProfile.objects.get_or_create(
            user=request.user
        )

        is_online = request.data.get("is_online")
        allow_last_seen = request.data.get("allow_last_seen")

        # Update online status
        if is_online is not None:

            profile.is_online = bool(is_online)

            if profile.is_online:
                profile.last_seen = None
            else:
                profile.last_seen = timezone.now()

        # Update Last Seen privacy setting
        if allow_last_seen is not None:
            profile.allow_last_seen = bool(
                allow_last_seen
            )

        profile.save()

        return Response({
            "is_online": profile.is_online,
            "last_seen": profile.last_seen,
            "allow_last_seen": profile.allow_last_seen,
        })

class UsersListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        users = User.objects.all()

        data = []

        for user in users:

            profile, created = UserProfile.objects.get_or_create(
                user=user
            )

            # Determine whether the current user
            # is allowed to see this user's last seen.
            if profile.allow_last_seen:
                last_seen = profile.last_seen
            else:
                last_seen = None

            data.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_online": profile.is_online,
                "last_seen": last_seen,
            })

        return Response(data)

class MessageListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        receiver_id = request.query_params.get("receiver")

        if not receiver_id:
            return Response(
                {"error": "receiver is required"},
                status=400
            )

        messages = Message.objects.filter(
            Q(sender=request.user, receiver_id=receiver_id) |
            Q(sender_id=receiver_id, receiver=request.user)
        ).order_by("created_at")

        serializer = MessageSerializer(messages, many=True)

        return Response(serializer.data)

    def post(self, request):
        receiver_id = request.data.get("receiver")
        text = request.data.get("text")

        if not receiver_id:
            return Response(
                {"error": "receiver is required"},
                status=400
            )

        if not text:
            return Response(
                {"error": "text is required"},
                status=400
            )

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Receiver not found"},
                status=404
            )

        message = Message.objects.create(
            sender=request.user,
            receiver=receiver,
            text=text
        )

        serializer = MessageSerializer(message)

        return Response(serializer.data, status=201)

class GroupListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        groups = Group.objects.filter(
            members=request.user
        ).order_by("-created_at")

        serializer = GroupSerializer(
            groups,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        name = request.data.get("name")
        member_ids = request.data.get("members", [])

        if not name:
            return Response(
                {"error": "Group name is required"},
                status=400
            )

        group = Group.objects.create(
            name=name,
            created_by=request.user
        )

        # Creator automatically becomes a member
        group.members.add(request.user)

        # Add selected members
        if member_ids:

            users = User.objects.filter(
                id__in=member_ids
            )

            group.members.add(*users)

        serializer = GroupSerializer(group)

        return Response(
            serializer.data,
            status=201
        )

class GroupMessageListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):

        try:
            group = Group.objects.get(
                id=group_id
            )
        except Group.DoesNotExist:
            return Response(
                {"error": "Group not found"},
                status=404
            )

        if not group.members.filter(
            id=request.user.id
        ).exists():
            return Response(
                {"error": "You are not a member of this group"},
                status=403
            )

        messages = GroupMessage.objects.filter(
            group=group
        ).order_by("created_at")

        serializer = GroupMessageSerializer(
            messages,
            many=True
        )

        return Response(serializer.data)

    def post(self, request, group_id):

        text = request.data.get("text")

        if not text:
            return Response(
                {"error": "text is required"},
                status=400
            )

        try:
            group = Group.objects.get(
                id=group_id
            )
        except Group.DoesNotExist:
            return Response(
                {"error": "Group not found"},
                status=404
            )

        if not group.members.filter(
            id=request.user.id
        ).exists():
            return Response(
                {"error": "You are not a member of this group"},
                status=403
            )

        message = GroupMessage.objects.create(
            group=group,
            sender=request.user,
            text=text
        )

        serializer = GroupMessageSerializer(
            message
        )

        return Response(
            serializer.data,
            status=201
        )

class NotificationListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        notifications = Notification.objects.filter(
            recipient=request.user
        ).order_by("-created_at")

        data = []

        for notification in notifications:

            data.append({
                "id": notification.id,
                "type": notification.notification_type,
                "title": notification.title,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at,
            })

        return Response(data)

class MarkAllNotificationsReadView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(
            is_read=True
        )

        return Response({
            "message": "All notifications marked as read."
        })