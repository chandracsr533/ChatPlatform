import { useEffect, useState } from "react";
import "./Navbar.css";
import {
    FaBars,
    FaBell,
    FaCog,
} from "react-icons/fa";
import { getProfile } from "../../services/api";
import { getAvatarGradient, getInitials } from "../../utils/avatar";

function Navbar({
    activePage = "dashboard",
    setActivePage = () => { },
    unreadNotifications = 0,
    setUnreadNotifications = () => { },
}) {
    const [username, setUsername] = useState(
        localStorage.getItem("username") || "User"
    );
    const [profileImage, setProfileImage] = useState(
        localStorage.getItem("profileImage") || ""
    );

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            getProfile(accessToken)
                .then((res) => {
                    if (res.data) {
                        const realUser = res.data.username || "User";
                        const realImg = res.data.profile_image || "";
                        setUsername(realUser);
                        setProfileImage(realImg);
                        localStorage.setItem("username", realUser);
                        if (realImg) {
                            localStorage.setItem("profileImage", realImg);
                        } else {
                            localStorage.removeItem("profileImage");
                        }
                    }
                })
                .catch((err) => {
                    console.error("Failed to load user profile in Navbar:", err);
                });
        }

        const handleStorage = () => {
            setUsername(localStorage.getItem("username") || "User");
            setProfileImage(localStorage.getItem("profileImage") || "");
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const pageTitles = {
        dashboard: "Dashboard",
        chats: "Chats",
        groups: "Group Chats",
        notifications: "Notifications",
        profile: "My Profile",
        settings: "Settings",
    };

    return (
        <div className="navbar">
            {/* Left Section - Dynamic Page Title */}
            <div className="navbar-left">
                <FaBars className="menu-icon" />
                <h3>{pageTitles[activePage] || "Dashboard"}</h3>
            </div>

            {/* Right Section - Notifications, Settings, Profile */}
            <div className="navbar-right">
                <div
                    className="nav-icon-wrapper"
                    title="Notifications"
                    onClick={() => {
                        setActivePage("notifications");
                        setUnreadNotifications(0);
                    }}
                >
                    <FaBell className="nav-icon" />
                    {unreadNotifications > 0 && (
                        <span className="navbar-badge">{unreadNotifications}</span>
                    )}
                </div>

                <div
                    className="nav-icon-wrapper"
                    title="Settings"
                    onClick={() => setActivePage("settings")}
                >
                    <FaCog className="nav-icon" />
                </div>

                <div
                    className="profile"
                    onClick={() => setActivePage("profile")}
                    title="View Profile"
                >
                    {profileImage ? (
                        <img
                            src={profileImage}
                            alt={username}
                            className="profile-img"
                            onError={() => setProfileImage("")}
                        />
                    ) : (
                        <div
                            className="navbar-avatar-initial"
                            style={{ background: getAvatarGradient(username) }}
                        >
                            {getInitials(username)}
                        </div>
                    )}

                    <span>{username}</span>
                </div>
            </div>
        </div>
    );
}

export default Navbar;