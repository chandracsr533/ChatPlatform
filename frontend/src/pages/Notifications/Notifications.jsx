import { useEffect, useState } from "react";
import {
    getNotifications,
    markAllNotificationsAsRead,
} from "../../services/api";
import "./Notifications.css";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {

        const fetchNotifications = async () => {

            const accessToken =
                localStorage.getItem("accessToken");

            if (!accessToken) {
                return;
            }

            try {

                const response =
                    await getNotifications(
                        accessToken
                    );

                const formattedNotifications =
                    response.data.map((notification) => ({

                        id: notification.id,

                        icon:
                            notification.type === "message"
                                ? "💬"
                                : notification.type === "group"
                                    ? "👥"
                                    : "🔔",

                        title: notification.title,

                        text: notification.message,

                        time: new Date(
                            notification.created_at
                        ).toLocaleString(),

                        read: notification.is_read,

                    }));

                setNotifications(
                    formattedNotifications
                );

            } catch (error) {

                console.error(
                    "Failed to fetch notifications:",
                    error
                );

            }

        };

        fetchNotifications();

    }, []);
    const handleMarkAllAsRead = async () => {

        console.log("Mark all as read button clicked");

        const accessToken =
            localStorage.getItem("accessToken");

        if (!accessToken) {
            console.log("Access token not found");
            return;
        }

        try {

            const response =
                await markAllNotificationsAsRead(
                    accessToken
                );

            console.log(
                "Mark all as read response:",
                response.data
            );

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    read: true,
                }))
            );

        } catch (error) {

            console.error(
                "Failed to mark notifications as read:",
                error
            );

        }
    };

    return (
        <div className="notifications-page">

            <div className="notifications-header">
                <div>
                    <h2>Notifications</h2>
                    <p>Stay updated with your chats and groups.</p>
                </div>

                <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                >
                    Mark all as read
                </button>
            </div>

            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="no-notifications">
                        <div className="no-notifications-icon">🔔</div>
                        <h3>No notifications</h3>
                        <p>You're all caught up! New notifications will appear here.</p>
                    </div>
                ) : (
                    notifications.map((notification) => (

                        <div
                            key={notification.id}
                            className={
                                notification.read
                                    ? "notification-item read"
                                    : "notification-item unread"
                            }
                        >

                            <div className="notification-icon">
                                {notification.icon}
                            </div>

                            <div className="notification-content">

                                <h4>
                                    {notification.title}
                                </h4>

                                <p>
                                    {notification.text}
                                </p>

                                <span>
                                    {notification.time}
                                </span>

                            </div>

                        </div>

                    ))
                )}
            </div>

        </div>
    );
}

export default Notifications;