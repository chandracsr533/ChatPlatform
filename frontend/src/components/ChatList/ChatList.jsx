import { useState } from "react";
import "./ChatList.css";
import { FaSearch } from "react-icons/fa";


/*
    Format Last Seen time
*/
const formatLastSeen = (lastSeen) => {

    if (!lastSeen) {
        return "Last seen hidden";
    }

    const date = new Date(lastSeen);

    if (isNaN(date.getTime())) {
        return "Last seen unavailable";
    }

    const now = new Date();

    const difference =
        Math.floor(
            (now - date) / 1000
        );

    if (difference < 60) {
        return "Last seen just now";
    }

    const minutes =
        Math.floor(
            difference / 60
        );

    if (minutes < 60) {
        return `Last seen ${minutes} min ago`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    if (hours < 24) {
        return `Last seen ${hours} hr ago`;
    }

    const days =
        Math.floor(
            hours / 24
        );

    if (days === 1) {
        return "Last seen yesterday";
    }

    return `Last seen ${days} days ago`;
};


function ChatList({
    users,
    selectedChat,
    setSelectedChat,
}) {

    const [searchTerm, setSearchTerm] =
        useState("");


    /*
        Filter users according to search
    */
    const filteredUsers = users.filter((user) => {

        const userName =
            user.name ||
            user.username ||
            "";

        return userName
            .toLowerCase()
            .includes(
                searchTerm.toLowerCase()
            );
    });


    /*
        Sort users according to chat time
    */
    const sortedUsers =
        [...filteredUsers].sort((a, b) => {

            if (!a.time || !b.time) {
                return 0;
            }

            return (
                new Date(
                    `1970/01/01 ${b.time}`
                ) -
                new Date(
                    `1970/01/01 ${a.time}`
                )
            );
        });


    return (

        <div className="chat-list">


            {/* =========================
                SEARCH
            ========================= */}

            <div className="chat-search">

                <FaSearch
                    className="search-icon"
                />

                <input
                    type="text"
                    placeholder="Search chats..."
                    className="search-box"
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(
                            e.target.value
                        )
                    }
                />

            </div>


            {/* =========================
                CHAT USERS
            ========================= */}

            {sortedUsers.map((user) => {


                const userName =
                    user.name ||
                    user.username ||
                    "Unknown User";


                const userMessage =
                    user.lastMessage ||
                    "No messages yet";


                const userTime =
                    user.time ||
                    "";


                const userImage =
                    user.image ||
                    "";


                /*
                    Online status from Django
                */
                const isOnline =
                    user.is_online === true;


                /*
                    Display text
                */
                const statusText =
                    isOnline
                        ? "Online"
                        : formatLastSeen(
                            user.last_seen
                        );


                const unreadCount =
                    user.unread ||
                    0;


                return (

                    <div
                        className={`chat-user ${selectedChat?.id === user.id
                                ? "active-chat"
                                : ""
                            }`}
                        key={user.id}
                        onClick={() =>
                            setSelectedChat(user)
                        }
                    >


                        {/* =========================
                            AVATAR
                        ========================= */}

                        <div className="avatar">

                            {userImage && (

                                <img
                                    src={userImage}
                                    alt={userName}
                                    className="avatar-img"
                                />

                            )}


                            <span
                                className={
                                    isOnline
                                        ? "status online"
                                        : "status offline"
                                }
                                title={statusText}
                            >
                            </span>

                        </div>


                        {/* =========================
                            USER INFORMATION
                        ========================= */}

                        <div className="user-info">


                            {/* USERNAME + TIME */}

                            <div className="user-top">

                                <div className="user-name-status">

                                    <h5>
                                        {userName}
                                    </h5>


                                    <span
                                        className={
                                            isOnline
                                                ? "user-online-text"
                                                : "user-last-seen"
                                        }
                                    >
                                        {statusText}
                                    </span>

                                </div>


                                <span className="chat-time">

                                    {userTime}

                                </span>

                            </div>


                            {/* MESSAGE + UNREAD */}

                            <div className="user-bottom">

                                <p>
                                    {userMessage}
                                </p>


                                {unreadCount > 0 && (

                                    <span className="unread-badge">

                                        {unreadCount}

                                    </span>

                                )}

                            </div>

                        </div>

                    </div>

                );

            })}


            {/* =========================
                NO USERS
            ========================= */}

            {filteredUsers.length === 0 && (

                <div className="no-chat">

                    No chats found

                </div>

            )}

        </div>
    );
}


export default ChatList;
