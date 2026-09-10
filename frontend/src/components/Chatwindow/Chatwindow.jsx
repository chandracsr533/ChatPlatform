import EmojiPicker from "emoji-picker-react";

import {
    FaSmile,
    FaPaperclip,
    FaMicrophone,
    FaPaperPlane,
    FaTrash,
} from "react-icons/fa";

import { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import ChatHeader from "../ChatHeader/ChatHeader";
import {
    getMessages,
    sendMessage,
    getProfile,
} from "../../services/api";
const reactions = [
    "👍",
    "❤️",
    "😂",
    "😮",
    "😢",
    "👏",
];

function ChatWindow({
    selectedChat,
    darkMode,
    setDarkMode,
    setUsers,
}) {
    const accessToken = localStorage.getItem("accessToken");
    const [currentUsername, setCurrentUsername] = useState("");
    const [message, setMessage] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const [messages, setMessages] = useState(
        selectedChat?.messages || []
    );

    const [selectedMessage, setSelectedMessage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {

        const fetchMessages = async () => {

            if (!selectedChat?.id || !accessToken) {
                setMessages([]);
                return;
            }

            console.log("Selected Chat:", selectedChat);
            console.log("Selected Chat ID:", selectedChat?.id);
            try {

                const response = await getMessages(
                    accessToken,
                    selectedChat.id
                );

                const backendMessages = response.data.map((msg) => ({
                    id: msg.id,

                    sender:
                        msg.sender === currentUsername
                            ? "Me"
                            : msg.sender,

                    text: msg.text,

                    time: new Date(
                        msg.created_at
                    ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),

                    status:
                        msg.sender === currentUsername
                            ? "sent"
                            : "read",

                    type: "text",

                    reaction: "",
                }));

                setMessages((previousMessages) => {

                    // Check whether the messages actually changed
                    const messagesChanged =
                        previousMessages.length !== backendMessages.length ||
                        previousMessages.some(
                            (message, index) =>
                                message.id !== backendMessages[index]?.id ||
                                message.text !== backendMessages[index]?.text
                        );

                    // If nothing changed, keep the existing messages
                    if (!messagesChanged) {
                        return previousMessages;
                    }

                    // Otherwise update with the latest messages
                    return backendMessages;
                });

            } catch (error) {

                console.error(
                    "Failed to fetch messages:",
                    error
                );

            }

            setSelectedMessage(null);
        };


        // Fetch messages immediately
        fetchMessages();


        // Fetch new messages every 3 seconds
        const intervalId = setInterval(
            fetchMessages,
            3000
        );


        // Cleanup when chat changes
        return () => {
            clearInterval(intervalId);
        };

    }, [
        selectedChat,
        accessToken,
        currentUsername
    ]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!accessToken) {
                return;
            }

            try {
                const response = await getProfile(accessToken);

                setCurrentUsername(response.data.username);

                console.log(
                    "Logged-in user:",
                    response.data.username
                );

            } catch (error) {
                console.error(
                    "Failed to fetch profile:",
                    error
                );
            }
        };

        fetchProfile();
    }, [accessToken]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const handleDeleteMessage = (id) => {
        setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.id !== id)
        );

        setSelectedMessage(null);
    };
    const handleFileUpload = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const isImage = file.type.startsWith("image/");

        const newMessage = {
            id: Date.now(),
            sender: "Me",
            type: isImage ? "image" : "file",
            fileName: file.name,
            fileUrl: URL.createObjectURL(file),
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            status: "sent",
            reaction: "",
        };

        setMessages((prev) => [...prev, newMessage]);

        e.target.value = "";
    };

    const handleVoiceRecording = async () => {

        if (!isRecording) {

            try {

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });

                const mediaRecorder = new MediaRecorder(stream);

                mediaRecorderRef.current = mediaRecorder;

                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorder.onstop = () => {

                    const audioBlob = new Blob(audioChunksRef.current, {
                        type: "audio/webm",
                    });

                    const audioUrl = URL.createObjectURL(audioBlob);

                    const voiceMessage = {
                        id: Date.now(),
                        sender: "Me",
                        type: "audio",
                        audio: audioUrl,
                        time: new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        status: "sent",
                        reaction: "",
                    };

                    setMessages((prev) => [...prev, voiceMessage]);
                };

                mediaRecorder.start();

                setIsRecording(true);

            } catch (error) {
                alert("Microphone permission denied.");
            }

        } else {

            mediaRecorderRef.current.stop();

            setIsRecording(false);
        }
    };

    const handleSend = async () => {

        if (message.trim() === "") return;

        if (isSending) return;

        if (!accessToken) {
            console.error("Access token not found.");
            return;
        }

        if (!selectedChat?.id) {
            console.error("No chat selected.");
            return;
        }

        const textToSend = message.trim();

        try {

            setIsSending(true);

            const response = await sendMessage(
                accessToken,
                selectedChat.id,
                textToSend
            );

            const savedMessage = response.data;

            const newMessage = {
                id: savedMessage.id,
                sender: "Me",
                text: savedMessage.text,
                time: new Date(
                    savedMessage.created_at
                ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                status: "sent",
                type: "text",
                reaction: "",
            };

            setMessages((prevMessages) => [
                ...prevMessages,
                newMessage,
            ]);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === selectedChat.id
                        ? {
                            ...user,
                            lastMessage: savedMessage.text,
                            time: newMessage.time,
                            unread: 0,
                        }
                        : user
                )
            );

            setMessage("");
            setIsTyping(false);

        } catch (error) {

            console.error(
                "Failed to send message:",
                error
            );

            alert(
                "Failed to send message. Please try again."
            );

        } finally {

            setIsSending(false);

        }
    };

    return (
        <div className={darkMode ? "chat-window dark" : "chat-window"}>

            {/* Professional Chat Header */}
            <ChatHeader
                selectedChat={selectedChat}
                isTyping={isTyping}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />
            {/* Messages */}
            <div className="messages">


                {messages.map((msg) => (

                    <div
                        key={msg.id}
                        className={
                            msg.sender === "Me"
                                ? "sent"
                                : "received"
                        }
                        onClick={() =>
                            setSelectedMessage(
                                selectedMessage === msg.id ? null : msg.id
                            )
                        }
                    >

                        {msg.type === "image" ? (

                            <img
                                src={msg.fileUrl}
                                alt="Shared"
                                className="chat-image"
                            />

                        ) : msg.type === "file" ? (

                            <a
                                href={msg.fileUrl}
                                download={msg.fileName}
                                className="chat-file"
                            >
                                📄 {msg.fileName}
                            </a>

                        ) : msg.type === "audio" ? (

                            <audio
                                controls
                                className="chat-audio"
                            >
                                <source
                                    src={msg.audio}
                                    type="audio/webm"
                                />
                                Your browser does not support audio.
                            </audio>

                        ) : editingId === msg.id ? (

                            <input
                                className="edit-input"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {

                                        setMessages((prev) =>
                                            prev.map((m) =>
                                                m.id === msg.id
                                                    ? { ...m, text: editingText }
                                                    : m
                                            )
                                        );

                                        setEditingId(null);
                                        setEditingText("");
                                    }
                                }}
                                autoFocus
                            />

                        ) : (

                            <p className="message-text">
                                {msg.text}
                            </p>

                        )}

                        <div className="message-footer">

                            <span className="message-time">
                                {msg.time}
                            </span>

                            {msg.sender === "Me" && (

                                <span
                                    className={`message-status ${msg.status}`}
                                >
                                    {msg.status === "sent"
                                        ? "✓"
                                        : "✓✓"}
                                </span>

                            )}

                        </div>

                        {/* Show Selected Reaction */}

                        {msg.reaction && (

                            <div className="message-reaction">
                                {msg.reaction}
                            </div>

                        )}
                        {msg.sender === "Me" && selectedMessage === msg.id && (
                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    setMessages((prevMessages) =>
                                        prevMessages.filter((m) => m.id !== msg.id)
                                    );

                                    setSelectedMessage(null);
                                }}
                            >
                                🗑 Delete
                            </button>

                        )}
                        {msg.sender === "Me" && selectedMessage === msg.id && (
                            <button
                                className="edit-btn"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    setEditingId(msg.id);
                                    setEditingText(msg.text);

                                    setSelectedMessage(null);
                                }}
                            >
                                ✏️ Edit
                            </button>
                        )}


                        {/* Reaction Picker */}

                        {selectedMessage === msg.id && (

                            <div className="reaction-picker">
                                {selectedMessage === msg.id && msg.sender === "Me" && (

                                    <div
                                        className="delete-message"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteMessage(msg.id);
                                        }}
                                    >
                                        <FaTrash />
                                        <span>Delete</span>
                                    </div>

                                )}

                                {reactions.map((emoji) => (

                                    <span
                                        key={emoji}
                                        className="reaction-option"
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            setMessages((prev) =>
                                                prev.map((m) =>
                                                    m.id === msg.id
                                                        ? {
                                                            ...m,
                                                            reaction: emoji,
                                                        }
                                                        : m
                                                )
                                            );

                                            setSelectedMessage(null);
                                        }}
                                    >
                                        {emoji}
                                    </span>

                                ))}

                            </div>

                        )}

                    </div>

                ))}

                <div ref={messagesEndRef}></div>

            </div>

            {/* Message Input */}
            {showEmojiPicker && (
                <div className="emoji-picker">

                    <button
                        className="emoji-close"
                        onClick={() => setShowEmojiPicker(false)}
                    >
                        ✖
                    </button>

                    <EmojiPicker
                        onEmojiClick={(emojiData) => {
                            setMessage((prev) => prev + emojiData.emoji);
                        }}
                    />

                </div>
            )}
            <div className="message-box">

                <FaSmile
                    className="input-icon"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                />
                <FaPaperclip
                    className="input-icon"
                    onClick={() => fileInputRef.current.click()}
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                />
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => {
                        const value = e.target.value;

                        setMessage(value);

                        setIsTyping(value.trim().length > 0);
                    }}
                    onKeyDown={(e) => {
                        if (
                            e.key === "Enter" &&
                            !isSending &&
                            message.trim() !== ""
                        ) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />

                <FaMicrophone
                    className={`input-icon ${isRecording ? "recording" : ""}`}
                    onClick={handleVoiceRecording}
                />
                <button
                    className="send-btn"
                    onClick={handleSend}
                    disabled={isSending || message.trim() === ""}
                >
                    {isSending
                        ? "..."
                        : <FaPaperPlane />
                    }
                </button>

            </div>

        </div>
    );
}

export default ChatWindow;