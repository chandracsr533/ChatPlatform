import { useEffect, useRef, useState } from "react";

import {
    getGroups,
    createGroup,
    getGroupMessages,
    sendGroupMessage,
    getUsers,
} from "../../services/api";

import "./GroupChat.css";


function GroupChat() {

    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const messagesEndRef = useRef(null);


    const accessToken = localStorage.getItem("accessToken");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const username = localStorage.getItem("username");

    // Fetch groups
    useEffect(() => {

        const fetchGroups = async () => {

            if (!accessToken) {
                return;
            }

            try {

                const response = await getGroups(
                    accessToken
                );

                setGroups(response.data);

                if (response.data.length > 0) {
                    setSelectedGroup(response.data[0]);
                }

            } catch (error) {

                console.error(
                    "Failed to fetch groups:",
                    error
                );

            }
        };

        fetchGroups();

    }, [accessToken]);


    // Fetch messages when group changes
    useEffect(() => {
        if (!selectedGroup || !accessToken) {
            setMessages([]);
            return;
        }

        let isMounted = true;

        const fetchGroupMessages = async (isInitial = false) => {
            try {
                if (isInitial) {
                    setLoading(true);
                }

                const response = await getGroupMessages(
                    accessToken,
                    selectedGroup.id
                );

                if (!isMounted) return;

                const formattedMessages = response.data.map((msg) => ({
                    id: msg.id,
                    sender: msg.sender,
                    text: msg.text,
                    file: msg.file,
                    message_type: msg.message_type,
                    time: new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                }));

                setMessages(formattedMessages);
            } catch (error) {
                console.error("Failed to fetch group messages:", error);
            } finally {
                if (isMounted && isInitial) {
                    setLoading(false);
                }
            }
        };

        fetchGroupMessages(true);
        const interval = setInterval(() => fetchGroupMessages(false), 3000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [selectedGroup, accessToken]);

    // Fetch users for creating a group
    useEffect(() => {

        const fetchUsers = async () => {

            if (!accessToken) {
                return;
            }

            try {

                const response = await getUsers(
                    accessToken
                );

                setAvailableUsers(response.data);

            } catch (error) {

                console.error(
                    "Failed to fetch users:",
                    error
                );

            }

        };

        fetchUsers();

    }, [accessToken]);

    // Select / deselect group members
    const handleMemberToggle = (userId) => {

        setSelectedMembers((prev) => {

            if (prev.includes(userId)) {

                return prev.filter(
                    (id) => id !== userId
                );

            }

            return [
                ...prev,
                userId
            ];

        });

    };
    // Create a new group
    const handleCreateGroup = async () => {

        if (!groupName.trim()) {
            alert("Please enter a group name.");
            return;
        }

        if (selectedMembers.length === 0) {
            alert("Please select at least one member.");
            return;
        }

        try {

            const response = await createGroup(
                accessToken,
                groupName.trim(),
                selectedMembers
            );

            console.log(
                "Group created successfully:",
                response.data
            );

            const newGroup = response.data;

            setGroups((prev) => [
                ...prev,
                newGroup
            ]);

            setSelectedGroup(newGroup);

            setGroupName("");
            setSelectedMembers([]);
            setShowCreateGroup(false);

        } catch (error) {

            console.error(
                "Failed to create group:",
                error
            );

            alert(
                "Failed to create group. Check the browser console."
            );

        }

    };


    const handleSelectGroup = (group) => {

        setSelectedGroup(group);

        setMessages([]);

    };

    // Send group message
    const handleSendMessage = async () => {

        if (
            !message.trim() ||
            !selectedGroup ||
            !accessToken
        ) {
            return;
        }

        const textToSend = message.trim();

        try {

            const response =
                await sendGroupMessage(
                    accessToken,
                    selectedGroup.id,
                    textToSend
                );

            const savedMessage = response.data;

            const newMessage = {

                id: savedMessage.id,

                sender: savedMessage.sender,

                text: savedMessage.text,

                time: new Date(
                    savedMessage.created_at
                ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),

            };

            setMessages((prev) => [
                ...prev,
                newMessage,
            ]);

            setMessage("");

        } catch (error) {

            console.error(
                "Failed to send group message:",
                error
            );

        }

    };


    return (

        <div className="group-chat">

            <div className="group-chat-header">

                <div>
                    <h3>Group Chats</h3>

                    <span>
                        {groups.length} group
                        {groups.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <button
                    type="button"
                    className="create-group-button"
                    onClick={() =>
                        setShowCreateGroup(!showCreateGroup)
                    }
                >
                    + Create
                </button>

            </div>
            {showCreateGroup && (

                <div className="create-group-form">

                    <input
                        type="text"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) =>
                            setGroupName(e.target.value)
                        }
                    />

                    <h4>Select Members</h4>

                    <div className="member-selection">

                        {availableUsers
                            .filter(
                                (user) =>
                                    user.username !== username
                            )
                            .map((user) => (

                                <label
                                    key={user.id}
                                    className="member-option"
                                >

                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.includes(
                                            user.id
                                        )}
                                        onChange={() =>
                                            handleMemberToggle(
                                                user.id
                                            )
                                        }
                                    />

                                    <span>
                                        {user.username}
                                    </span>

                                </label>

                            ))}

                    </div>

                    <button
                        type="button"
                        className="create-group-submit"
                        onClick={handleCreateGroup}
                    >
                        Create Group
                    </button>

                </div>

            )}


            <div className="group-list">

                {groups.length === 0 ? (

                    <p className="no-groups">
                        No groups available
                    </p>

                ) : (

                    groups.map((group) => (

                        <div
                            key={group.id}
                            className={
                                selectedGroup?.id === group.id
                                    ? "group-item active"
                                    : "group-item"
                            }

                            onClick={() => handleSelectGroup(group)}
                        >

                            <div className="group-name">
                                {group.name}
                            </div>

                            <div className="group-members">
                                {group.members.length} members
                            </div>

                        </div>

                    ))

                )}

            </div>


            {selectedGroup && (

                <div className="group-messages">

                    <div className="selected-group-header">

                        <h3>
                            {selectedGroup.name}
                        </h3>

                        <span>
                            {selectedGroup.members.length} members
                        </span>

                    </div>


                    <div className="messages-container">

                        {loading ? (

                            <p>Loading messages...</p>

                        ) : messages.length === 0 ? (

                            <p>
                                No messages yet.
                            </p>

                        ) : (

                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={
                                        msg.sender === username
                                            ? "group-message sent"
                                            : "group-message received"
                                    }
                                >
                                    <strong>{msg.sender}</strong>

                                    {msg.text && <p>{msg.text}</p>}

                                    {msg.file && msg.message_type === "image" && (
                                        <div className="group-file-attachment">
                                            <img
                                                src={msg.file}
                                                alt="Attachment"
                                                className="group-file-image"
                                            />
                                        </div>
                                    )}

                                    {msg.file && msg.message_type === "audio" && (
                                        <div className="group-file-attachment">
                                            <audio
                                                controls
                                                src={msg.file}
                                                className="group-audio-player"
                                            />
                                        </div>
                                    )}

                                    {msg.file && msg.message_type === "file" && (
                                        <div className="group-file-attachment">
                                            <a
                                                href={msg.file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group-file-download"
                                            >
                                                📎 Download Attachment
                                            </a>
                                        </div>
                                    )}

                                    <small>{msg.time}</small>
                                </div>
                            ))

                        )}
                        <div ref={messagesEndRef} />

                    </div>


                    <div className="group-message-input">

                        <input
                            type="text"
                            placeholder="Type a group message..."
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                            onKeyDown={(e) => {

                                if (
                                    e.key === "Enter"
                                ) {
                                    handleSendMessage();
                                }

                            }}
                        />

                        <button
                            onClick={handleSendMessage}
                        >
                            Send
                        </button>

                    </div>

                </div>

            )}

        </div>

    );

}


export default GroupChat;