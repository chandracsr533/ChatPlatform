import "./Sidebar.css";

import {
    FaHome,
    FaComments,
    FaUsers,
    FaBell,
    FaUser,
    FaCog,
    FaSignOutAlt,
} from "react-icons/fa";


function Sidebar({
    activePage,
    setActivePage,
    handleLogout,
    unreadNotifications,
    setUnreadNotifications,
}) {

    return (

        <div className="sidebar">

            <h2 className="logo">
                💬 ChatPlatform
            </h2>


            <ul className="menu">

                {/* Dashboard */}

                <li
                    className={
                        activePage === "dashboard"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActivePage("dashboard")
                    }
                >
                    <FaHome />
                    Dashboard
                </li>


                {/* Chats */}

                <li
                    className={
                        activePage === "chats"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActivePage("chats")
                    }
                >
                    <FaComments />
                    Chats
                </li>


                {/* Groups */}

                <li
                    className={
                        activePage === "groups"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActivePage("groups")
                    }
                >
                    <FaUsers />
                    Groups
                </li>

                {/* Notifications */}

                <li
                    className={
                        activePage === "notifications"
                            ? "active"
                            : ""
                    }
                    onClick={() => {
                        setActivePage("notifications");
                        setUnreadNotifications(0);
                    }}
                >
                    <FaBell />

                    <span>
                        Notifications
                    </span>

                    {unreadNotifications > 0 && (
                        <span className="notification-badge">
                            {unreadNotifications}
                        </span>
                    )}
                </li>


                {/* Profile */}

                <li
                    className={
                        activePage === "profile"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActivePage("profile")
                    }
                >
                    <FaUser />
                    Profile
                </li>


                {/* Settings */}

                <li
                    className={
                        activePage === "settings"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActivePage("settings")
                    }
                >
                    <FaCog />
                    Settings
                </li>


                {/* Logout */}

                <li
                    onClick={handleLogout}
                >
                    <FaSignOutAlt />
                    Logout
                </li>

            </ul>

        </div>

    );

}


export default Sidebar;