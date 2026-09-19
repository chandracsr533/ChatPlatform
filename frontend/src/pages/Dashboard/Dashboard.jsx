
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../../components/Layout/Layout";
import DashboardCards from "../../components/DashboardCards/DashboardCards";
import ChatList from "../../components/ChatList/ChatList";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import GroupChat from "../../components/GroupChat/GroupChat";
import Profile from "../Profile/Profile";
import Settings from "../Settings/Settings";

import Notifications from "../Notifications/Notifications";

import {
    getUsers,
    getNotifications,
} from "../../services/api";

import "./Dashboard.css";


function Dashboard() {

    const navigate = useNavigate();

    // const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);

    const [users, setUsers] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    const [unreadNotifications, setUnreadNotifications] = useState(0);
    // NEW
    const [notificationsEnabled, setNotificationsEnabled] =
        useState(
            localStorage.getItem("notifications") !== "false"
        );

    const [activePage, setActivePage] = useState("dashboard");

    const fetchUnreadNotifications = async () => {

        const accessToken =
            localStorage.getItem("accessToken");

        if (!accessToken) {
            return;
        }
        if (!notificationsEnabled) {
            setUnreadNotifications(0);
            return;
        }

        try {

            const response =
                await getNotifications(
                    accessToken
                );

            const unreadCount =
                response.data.filter(
                    (notification) =>
                        !notification.is_read
                ).length;

            setUnreadNotifications(
                unreadCount
            );

        } catch (error) {

            console.error(
                "Failed to fetch unread notifications:",
                error
            );

        }
    };
    useEffect(() => {
        fetchUnreadNotifications();
    }, [notificationsEnabled]);


    // Fetch real users from Django backend
    useEffect(() => {

        const fetchUsers = async () => {
            setUsersLoading(true);

            try {

                const accessToken =
                    localStorage.getItem("accessToken");

                if (!accessToken) {
                    return;
                }

                const response =
                    await getUsers(accessToken);

                console.log(
                    "Users received from backend:",
                    response.data
                );

                const backendUsers =
                    response.data.map((user, index) => ({

                        id: user.id,

                        username: user.username,

                        name: user.username,

                        email: user.email,

                        image: user.image || "",

                        lastMessage:
                            "No messages yet",

                        time: "",

                        // Use real Django online status
                        is_online:
                            user.is_online === true,

                        // Use real Django last seen
                        lastSeen:
                            user.last_seen || null,

                        unread: user.unread_count || 0,

                        messages: [],

                    }));

                setUsers((previousUsers) => {

                    return backendUsers.map((newUser) => {

                        const existingUser =
                            previousUsers.find(
                                (user) =>
                                    user.id === newUser.id
                            );

                        return {
                            ...newUser,

                            // Preserve existing UI data
                            lastMessage:
                                existingUser?.lastMessage ||
                                newUser.lastMessage,

                            time:
                                existingUser?.time ||
                                newUser.time,

                            unread:
                                selectedChat?.id === newUser.id
                                    ? 0
                                    : newUser.unread,

                            messages:
                                existingUser?.messages ||
                                [],
                        };
                    });
                });

            } catch (error) {

                console.error(
                    "Failed to fetch users:",
                    error
                );

            } finally {

                setUsersLoading(false);

            }

        };


        // Fetch immediately
        fetchUsers();


        // Refresh online status every 10 seconds
        const intervalId =
            setInterval(
                fetchUsers,
                10000
            );


        // Cleanup interval
        return () => {
            clearInterval(intervalId);
        };

    }, []);



    // Select private chat
    const handleSelectChat = (user) => {

        const updatedUsers =
            users.map((u) =>
                u.id === user.id
                    ? { ...u, unread: 0 }
                    : u
            );

        setUsers(updatedUsers);

        const updatedSelected =
            updatedUsers.find(
                (u) => u.id === user.id
            );

        setSelectedChat(updatedSelected);
    };





    // Logout
    const handleLogout = async () => {

        const accessToken =
            localStorage.getItem("accessToken");

        if (accessToken) {

            try {

                await fetch(
                    "http://127.0.0.1:8000/api/accounts/status/",
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${accessToken}`,
                        },

                        body: JSON.stringify({
                            is_online: false,
                        }),
                    }
                );

            } catch (error) {

                console.error(
                    "Failed to update offline status:",
                    error
                );
            }
        }

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        localStorage.removeItem("profileImage");

        navigate("/login");
    };


    return (
        <Layout
            darkMode={darkMode}
            activePage={activePage}
            setActivePage={setActivePage}
            handleLogout={handleLogout}
            unreadNotifications={unreadNotifications}
            setUnreadNotifications={setUnreadNotifications}
        >

            <div className="dashboard-page">

                {/* =========================================
                    DASHBOARD PAGE
                ========================================= */}

                {activePage === "dashboard" && (

                    <DashboardCards />

                )}


                {/* =========================================
                    CHATS PAGE
                ========================================= */}

                {activePage === "chats" && (

                    <div className="chats-page">

                        <div className="dashboard-container">

                            {usersLoading ? (

                                <div className="users-loading">
                                    Loading users...
                                </div>

                            ) : users.length === 0 ? (

                                <div className="no-users">

                                    <div className="no-users-icon">
                                        👥
                                    </div>

                                    <h3>No users found</h3>

                                    <p>
                                        There are currently no users available to chat with.
                                    </p>

                                </div>

                            ) : (

                                <ChatList
                                    users={users}
                                    selectedChat={selectedChat}
                                    setSelectedChat={
                                        handleSelectChat
                                    }
                                />

                            )}
                            {selectedChat ? (

                                <ChatWindow
                                    selectedChat={selectedChat}
                                    darkMode={darkMode}
                                    setDarkMode={setDarkMode}
                                    setUsers={setUsers}
                                />

                            ) : (

                                <div className="empty-chat">

                                    <div className="empty-chat-icon">
                                        💬
                                    </div>

                                    <h2>Select a conversation</h2>

                                    <p>
                                        Choose a user from the chat list to start chatting.
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>

                )}


                {/* =========================================
                    GROUPS PAGE
                ========================================= */}

                {activePage === "groups" && (

                    <div className="groups-page">

                        <GroupChat />

                    </div>

                )}
                {activePage === "profile" && (
                    <Profile />
                )}

                {activePage === "settings" && (
                    <Settings
                        setNotificationsEnabled={
                            setNotificationsEnabled
                        }
                    />
                )}

                {/* =========================================
                     NOTIFICATIONS PAGE
                ========================================= */}

                {activePage === "notifications" && (

                    <Notifications />

                )}

            </div>

        </Layout>
    );

}


export default Dashboard;