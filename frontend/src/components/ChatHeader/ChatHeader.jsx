import "./ChatHeader.css";
import {
    FaPhone,
    FaVideo,
    FaEllipsisV,
    FaSun,
    FaMoon,
} from "react-icons/fa";
import { getAvatarGradient, getInitials } from "../../utils/avatar";

const formatLastSeen = (lastSeen) => {
    if (!lastSeen) {
        return "Last seen recently";
    }

    const date = new Date(lastSeen);
    if (isNaN(date.getTime())) {
        return "Offline";
    }

    const now = new Date();
    const difference = Math.floor((now - date) / 1000);

    if (difference < 60) {
        return "Last seen just now";
    }

    const minutes = Math.floor(difference / 60);
    if (minutes < 60) {
        return `Last seen ${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `Last seen ${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    if (days === 1) {
        return "Last seen yesterday";
    }

    return `Last seen ${days}d ago`;
};

function ChatHeader({
    selectedChat,
    darkMode,
    setDarkMode,
}) {
    if (!selectedChat) {
        return null;
    }

    const isOnline = selectedChat.is_online === true;
    const displayName = selectedChat.name || selectedChat.username || "Unknown User";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className={`chat-header ${darkMode ? "dark" : ""}`}>
            {/* User Information */}
            <div className="chat-user">
                <div className="chat-avatar-wrapper">
                    {selectedChat.image ? (
                        <img
                            src={selectedChat.image}
                            alt={displayName}
                            className="chat-user-img"
                            onError={(e) => {
                                e.target.style.display = "none";
                                const fb = e.target.parentElement.querySelector(".chat-avatar-fallback");
                                if (fb) fb.style.display = "flex";
                            }}
                        />
                    ) : null}
                    <div
                        className="chat-avatar-fallback"
                        style={{
                            display: selectedChat.image ? "none" : "flex",
                            background: getAvatarGradient(displayName),
                        }}
                    >
                        {getInitials(displayName)}
                    </div>
                    <span
                        className={`header-avatar-status ${isOnline ? "online" : "offline"}`}
                        title={isOnline ? "Online" : "Offline"}
                    />
                </div>

                <div className="chat-user-info">
                    <h4 className="chat-user-name">
                        {displayName}
                    </h4>

                    <div className="chat-user-status">
                        {isOnline ? (
                            <span className="status-badge online">
                                <span className="pulse-indicator"></span>
                                Online
                            </span>
                        ) : (
                            <span className="status-badge offline">
                                {formatLastSeen(selectedChat.last_seen)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Action Controls */}
            <div className="chat-header-actions">
                <button
                    type="button"
                    className="header-action-btn"
                    title="Voice Call"
                    onClick={() => alert(`Calling ${displayName}...`)}
                >
                    <FaPhone />
                </button>

                <button
                    type="button"
                    className="header-action-btn"
                    title="Video Call"
                    onClick={() => alert(`Starting video call with ${displayName}...`)}
                >
                    <FaVideo />
                </button>

                <button
                    type="button"
                    className="header-action-btn theme-toggle-btn"
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    onClick={() => setDarkMode(!darkMode)}
                >
                    {darkMode ? <FaSun className="theme-icon sun" /> : <FaMoon className="theme-icon moon" />}
                </button>

                <button
                    type="button"
                    className="header-action-btn"
                    title="More Options"
                >
                    <FaEllipsisV />
                </button>
            </div>
        </div>
    );
}

export default ChatHeader;
