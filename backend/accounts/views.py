

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

        if request.data.get("remove_image") in ["true", True, "1"]:
            if profile.profile_image:
                profile.profile_image.delete(save=False)
            profile.profile_image = None
            profile.save()

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

        users = User.objects.exclude(id=request.user.id)

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

            unread_count = Message.objects.filter(
                sender=user,
                receiver=request.user,
                is_read=False
            ).count()

            profile_image = ""
            if profile.profile_image:
                profile_image = request.build_absolute_uri(profile.profile_image.url)

            data.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_online": profile.is_online,
                "last_seen": last_seen,
                "unread_count": unread_count,
                "image": profile_image,
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

        # Mark all incoming messages from this user as read
        Message.objects.filter(
            sender_id=receiver_id,
            receiver=request.user,
            is_read=False
        ).update(is_read=True)

        messages = Message.objects.filter(
            Q(sender=request.user, receiver_id=receiver_id) |
            Q(sender_id=receiver_id, receiver=request.user)
        ).order_by("created_at")

        serializer = MessageSerializer(
            messages,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)

    def post(self, request):
        receiver_id = request.data.get("receiver")
        text = request.data.get("text", "")
        file = request.FILES.get("file")
        message_type = request.data.get("message_type", "text")

        if not receiver_id:
            return Response(
                {"error": "receiver is required"},
                status=400
            )

        if not text and not file:
            return Response(
                {"error": "text or file is required"},
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
            text=text,
            file=file,
            message_type=message_type
        )

        # Automatically create notification for receiver
        notification_preview = text if text else f"Sent a {message_type}"
        Notification.objects.create(
            recipient=receiver,
            notification_type="message",
            title=f"New message from {request.user.username}",
            message=notification_preview[:100],
        )

        serializer = MessageSerializer(
            message,
            context={"request": request}
        )

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
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)

    def post(self, request, group_id):

        text = request.data.get("text", "")
        file = request.FILES.get("file")
        message_type = request.data.get("message_type", "text")

        if not text and not file:
            return Response(
                {"error": "text or file is required"},
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
            text=text,
            file=file,
            message_type=message_type
        )

        # Notify other group members
        notification_preview = text if text else f"Shared a {message_type}"
        for member in group.members.exclude(id=request.user.id):
            Notification.objects.create(
                recipient=member,
                notification_type="group",
                title=f"New message in {group.name}",
                message=f"{request.user.username}: {notification_preview[:100]}",
            )

        serializer = GroupMessageSerializer(
            message,
            context={"request": request}
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


class MessageDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            message = Message.objects.get(pk=pk)
        except Message.DoesNotExist:
            return Response({"error": "Message not found"}, status=404)

        if message.sender != request.user:
            return Response({"error": "You can only delete your own messages"}, status=403)

        message.delete()
        return Response({"message": "Message deleted successfully"}, status=200)

    def patch(self, request, pk):
        try:
            message = Message.objects.get(pk=pk)
        except Message.DoesNotExist:
            return Response({"error": "Message not found"}, status=404)

        # Allow sender to edit text
        if "text" in request.data:
            if message.sender != request.user:
                return Response({"error": "You can only edit your own messages"}, status=403)
            message.text = request.data["text"]

        # Allow participants to add/update reaction
        if "reaction" in request.data:
            if request.user != message.sender and request.user != message.receiver:
                return Response({"error": "Not authorized to react to this message"}, status=403)
            message.reaction = request.data["reaction"]

        message.save()
        serializer = MessageSerializer(message, context={"request": request})
        return Response(serializer.data)


class DashboardStatsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        direct_count = Message.objects.filter(
            Q(sender=request.user) | Q(receiver=request.user)
        ).count()

        user_groups = Group.objects.filter(members=request.user)
        group_count = user_groups.count()
        group_messages_count = GroupMessage.objects.filter(group__in=user_groups).count()

        online_users_count = UserProfile.objects.filter(is_online=True).count()

        return Response({
            "messages_count": direct_count + group_messages_count,
            "groups_count": group_count,
            "online_users_count": online_users_count,
        })
