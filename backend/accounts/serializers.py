from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UserProfile, Message, Group, GroupMessage


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
        ]

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )

        UserProfile.objects.create(
            user=user
        )

        return user


class MessageSerializer(serializers.ModelSerializer):

    sender = serializers.CharField(
        source="sender.username",
        read_only=True
    )

    receiver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )

    class Meta:
        model = Message
        fields = [
            "id",
            "sender",
            "receiver",
            "text",
            "file",
            "message_type",
            "reaction",
            "is_read",
            "created_at",
        ]
        extra_kwargs = {
            "text": {"required": False, "allow_blank": True},
            "file": {"required": False, "allow_null": True},
            "reaction": {"required": False, "allow_blank": True},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.file:
            request = self.context.get("request")
            if request:
                data["file"] = request.build_absolute_uri(instance.file.url)
            else:
                data["file"] = instance.file.url
        else:
            data["file"] = None
        return data


class GroupSerializer(serializers.ModelSerializer):

    created_by = serializers.ReadOnlyField(
        source="created_by.username"
    )

    members = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="username"
    )

    class Meta:
        model = Group
        fields = [
            "id",
            "name",
            "created_by",
            "members",
            "created_at",
        ]


class GroupMessageSerializer(serializers.ModelSerializer):

    sender = serializers.ReadOnlyField(
        source="sender.username"
    )

    group = serializers.ReadOnlyField(
        source="group.id"
    )

    class Meta:
        model = GroupMessage
        fields = [
            "id",
            "group",
            "sender",
            "text",
            "file",
            "message_type",
            "created_at",
        ]
        extra_kwargs = {
            "text": {"required": False, "allow_blank": True},
            "file": {"required": False, "allow_null": True},
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.file:
            request = self.context.get("request")
            if request:
                data["file"] = request.build_absolute_uri(instance.file.url)
            else:
                data["file"] = instance.file.url
        else:
            data["file"] = None
        return data
class ProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username"
    )

    email = serializers.EmailField(
        source="user.email"
    )

    class Meta:
        model = UserProfile
        fields = [
            "username",
            "email",
            "profile_image",
            "is_online",
            "last_seen",
        ]

        read_only_fields = [
            "is_online",
            "last_seen",
        ]

    def to_representation(self, instance):

        data = super().to_representation(instance)

        if instance.profile_image:
            request = self.context.get("request")

            if request:
                data["profile_image"] = request.build_absolute_uri(
                    instance.profile_image.url
                )
            else:
                data["profile_image"] = instance.profile_image.url

        else:
            data["profile_image"] = ""

        return data

    def update(self, instance, validated_data):

        user_data = validated_data.pop(
            "user",
            {}
        )

        user = instance.user

        if "username" in user_data:
            user.username = user_data["username"]

        if "email" in user_data:
            user.email = user_data["email"]

        user.save()

        if "profile_image" in validated_data:
            instance.profile_image = validated_data[
                "profile_image"
            ]

        instance.save()

        return instance