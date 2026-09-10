import user1 from "../assets/images/user1.jpg";
import user2 from "../assets/images/user2.jpg";
import user3 from "../assets/images/user3.jpg";
import user4 from "../assets/images/user4.jpg";

const chatData = [
    {
        id: 1,
        name: "Mahesh",
        image: user1,
        lastMessage: "Hey! How are you?",
        time: "10:30 AM",
        online: true,
        lastSeen: "Today at 7:45 PM",
        unread: 2,
        messages: [
            {
                id: 1,
                sender: "Mahesh",
                text: "Hey! How are you? 👋",
                time: "10:20 AM",
                status: "read",
                type: "text",
                reaction: "",
            },
            {
                id: 2,
                sender: "Me",
                text: "I'm good! What about you?",
                time: "10:22 AM",
                status: "delivered",
                type: "text",
                reaction: "",
            },
            {
                id: 3,
                sender: "Mahesh",
                text: "Doing great 😊",
                time: "10:23 AM",
                status: "read",
                type: "text",
                reaction: "",
            },
        ],
    },

    {
        id: 2,
        name: "Priya",
        image: user2,
        lastMessage: "Meeting at 5 PM",
        time: "9:45 AM",
        online: false,
        lastSeen: "Today at 6:15 PM",
        unread: 0,
        messages: [
            {
                id: 1,
                sender: "Priya",
                text: "Don't forget today's meeting.",
                time: "9:30 AM",
                status: "read",
                type: "text",
                reaction: "",
            },
            {
                id: 2,
                sender: "Me",
                text: "Sure! I'll be there.",
                time: "9:35 AM",
                status: "sent",
                type: "text",
                reaction: "",
            },
        ],
    },

    {
        id: 3,
        name: "Arun",
        image: user3,
        lastMessage: "Project completed",
        time: "Yesterday",
        online: true,
        lastSeen: "Yesterday 9:30 PM",
        unread: 5,
        messages: [
            {
                id: 1,
                sender: "Arun",
                text: "Project completed successfully.",
                time: "Yesterday",
                status: "read",
                type: "text",
                reaction: "",
            },
            {
                id: 2,
                sender: "Me",
                text: "Excellent work! 🎉",
                time: "Yesterday",
                status: "sent",
                type: "text",
                reaction: "",
            },
        ],
    },

    {
        id: 4,
        name: "Lalitha",
        image: user4,
        lastMessage: "Good Morning 🌞",
        time: "8:30 AM",
        online: true,
        lastSeen: "Today at 8:00 AM",
        unread: 1,
        messages: [
            {
                id: 1,
                sender: "Lalitha",
                text: "Good Morning ☀️",
                time: "8:25 AM",
                status: "read",
                type: "text",
                reaction: "",
            },
            {
                id: 2,
                sender: "Me",
                text: "Good Morning! Have a nice day 😊",
                time: "8:27 AM",
                status: "delivered",
                type: "text",
                reaction: "",
            },
        ],
    },
];

export default chatData;