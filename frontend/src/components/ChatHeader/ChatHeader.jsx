import "./ChatHeader.css";
import {
    FaPhone,
    FaVideo,
    FaEllipsisV,
} from "react-icons/fa";

const formatLastSeen = (lastSeen) => {

    if (!lastSeen) {
        return "Last seen hidden";
    }

    const date = new Date(lastSeen);

    if (isNaN(date.getTime())) {
        return "Last seen unavailable";
    }

    const now = new Date();

    const difference = Math.floor(
        (now - date) / 1000
    );

    if (difference < 60) {
        return "Last seen just now";
    }

    const minutes = Math.floor(
        difference / 60
    );

    if (minutes < 60) {
        return `Last seen ${minutes} min ago`;
    }

    const hours = Math.floor(
        minutes / 60
    );

    if (hours < 24) {
        return `Last seen ${hours} hr ago`;
    }

    const days = Math.floor(
        hours / 24
    );

    if (days === 1) {
        return "Last seen yesterday";
    }

    return `Last seen ${days} days ago`;
};


function ChatHeader({
    selectedChat,
    darkMode,
    setDarkMode,
}) {

    if (!selectedChat) {
        return null;
    }

    const isOnline =
        selectedChat.is_online === true;

    const statusText = isOnline
        ? "🟢 Online"
        : `⚪ ${formatLastSeen(
            selectedChat.last_seen
        )}`;

    return (

        <div className="chat-header">

            {/* User Information */}

            <div className="chat-user">

                {selectedChat.image && (
                    <img
                        src={selectedChat.image}
                        alt={
                            selectedChat.name ||
                            selectedChat.username
                        }
                        className="chat-user-img"
                    />
                )}

                <div>

                    <h4>
                        {selectedChat.name ||
                            selectedChat.username ||
                            "Unknown User"}
                    </h4>

                    <span className="online-status">
                        {statusText}
                    </span>

                </div>

            </div>


            {/* Status + Theme Buttons */}

            <div className="header-buttons">

                <button
                    className="theme-btn"
                    onClick={() =>
                        setDarkMode(!darkMode)
                    }
                >
                    {darkMode
                        ? "☀️ Light"
                        : "🌙 Dark"}
                </button>

            </div>


            {/* Chat Actions */}

            <div className="chat-actions">

                <FaPhone />

                <FaVideo />

                <FaEllipsisV />

            </div>

        </div>
    );
}

export default ChatHeader;
