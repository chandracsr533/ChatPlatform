from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Message, Group, GroupMessage, Notification, UserProfile


class ChatPlatformAPITests(APITestCase):

    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="password123",
            first_name="Alice",
            last_name="Smith"
        )
        self.profile1 = UserProfile.objects.create(user=self.user1, is_online=True)

        self.user2 = User.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="password123",
            first_name="Bob",
            last_name="Jones"
        )
        self.profile2 = UserProfile.objects.create(user=self.user2, is_online=False)

    def test_user_registration(self):
        url = "/api/accounts/register/"
        data = {
            "username": "charlie",
            "email": "charlie@example.com",
            "password": "strongpassword123",
            "first_name": "Charlie",
            "last_name": "Brown"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="charlie").exists())
        self.assertTrue(UserProfile.objects.filter(user__username="charlie").exists())

    def test_user_login(self):
        url = "/api/accounts/login/"
        data = {
            "username": "alice",
            "password": "password123"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_direct_message_and_notification(self):
        self.client.force_authenticate(user=self.user1)

        # Send message from Alice to Bob
        url = "/api/accounts/messages/"
        data = {
            "receiver": self.user2.id,
            "text": "Hello Bob!",
            "message_type": "text"
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["text"], "Hello Bob!")

        # Verify notification created for Bob
        notifications = Notification.objects.filter(recipient=self.user2)
        self.assertEqual(notifications.count(), 1)
        self.assertEqual(notifications.first().notification_type, "message")
        self.assertIn("alice", notifications.first().title)

        # Authenticate as Bob and verify unread count
        self.client.force_authenticate(user=self.user2)
        users_resp = self.client.get("/api/accounts/users/")
        alice_data = next((u for u in users_resp.data if u["id"] == self.user1.id), None)
        self.assertIsNotNone(alice_data)
        self.assertEqual(alice_data["unread_count"], 1)

        # Bob reads messages
        read_resp = self.client.get(f"/api/accounts/messages/?receiver={self.user1.id}")
        self.assertEqual(read_resp.status_code, status.HTTP_200_OK)

        # Verify message marked as read
        msg = Message.objects.get(id=response.data["id"])
        self.assertTrue(msg.is_read)

    def test_message_reaction_and_delete(self):
        self.client.force_authenticate(user=self.user1)
        msg = Message.objects.create(
            sender=self.user1,
            receiver=self.user2,
            text="Initial text"
        )

        # React to message
        url = f"/api/accounts/messages/{msg.id}/"
        patch_resp = self.client.patch(url, {"reaction": "👍"}, format="json")
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        msg.refresh_from_db()
        self.assertEqual(msg.reaction, "👍")

        # Edit text
        edit_resp = self.client.patch(url, {"text": "Updated text"}, format="json")
        self.assertEqual(edit_resp.status_code, status.HTTP_200_OK)
        msg.refresh_from_db()
        self.assertEqual(msg.text, "Updated text")

        # Delete message
        del_resp = self.client.delete(url)
        self.assertEqual(del_resp.status_code, status.HTTP_200_OK)
        self.assertFalse(Message.objects.filter(id=msg.id).exists())

    def test_group_chat_and_notification(self):
        self.client.force_authenticate(user=self.user1)

        # Create group
        group_resp = self.client.post("/api/accounts/groups/", {
            "name": "Dev Team",
            "members": [self.user2.id]
        }, format="json")
        self.assertEqual(group_resp.status_code, status.HTTP_201_CREATED)
        group_id = group_resp.data["id"]

        # Send group message
        msg_resp = self.client.post(f"/api/accounts/groups/{group_id}/messages/", {
            "text": "Welcome team!"
        }, format="json")
        self.assertEqual(msg_resp.status_code, status.HTTP_201_CREATED)

        # Verify Bob receives group notification
        bob_notifications = Notification.objects.filter(recipient=self.user2, notification_type="group")
        self.assertEqual(bob_notifications.count(), 1)
        self.assertIn("Dev Team", bob_notifications.first().title)

    def test_dashboard_stats(self):
        self.client.force_authenticate(user=self.user1)
        Message.objects.create(sender=self.user1, receiver=self.user2, text="Hi")

        resp = self.client.get("/api/accounts/dashboard-stats/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("messages_count", resp.data)
        self.assertIn("groups_count", resp.data)
        self.assertIn("online_users_count", resp.data)
        self.assertGreaterEqual(resp.data["messages_count"], 1)
        self.assertGreaterEqual(resp.data["online_users_count"], 1)
