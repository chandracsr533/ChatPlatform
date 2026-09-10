import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});


// Automatically refresh the access token when it expires
API.interceptors.response.use(
    (response) => {
        return response;
    },

    async (error) => {

        const originalRequest = error.config;

        // If access token expired
        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;

            const refreshToken =
                localStorage.getItem("refreshToken");

            if (!refreshToken) {
                console.error("Refresh token not found.");
                return Promise.reject(error);
            }

            try {

                // Ask Django for a new access token
                const response = await axios.post(
                    "http://127.0.0.1:8000/api/accounts/token/refresh/",
                    {
                        refresh: refreshToken,
                    }
                );

                const newAccessToken = response.data.access;

                // Save new access token
                localStorage.setItem(
                    "accessToken",
                    newAccessToken
                );

                // Update original request
                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                // Try the original request again
                return API(originalRequest);

            } catch (refreshError) {

                console.error(
                    "Token refresh failed:",
                    refreshError
                );

                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);


// Get users
export const getUsers = (accessToken) => {
    return API.get("/accounts/users/", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};

// Get groups
export const getGroups = (accessToken) => {
    return API.get("/accounts/groups/", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};

// Create group
export const createGroup = (
    accessToken,
    name,
    members
) => {

    return API.post(
        "/accounts/groups/",
        {
            name: name,
            members: members,
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
};

// Get profile
export const getProfile = (accessToken) => {
    return API.get("/accounts/profile/", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};


// Get messages
export const getMessages = (accessToken, receiverId) => {
    return API.get(
        `/accounts/messages/?receiver=${receiverId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
};

// Get group messages
export const getGroupMessages = (
    accessToken,
    groupId
) => {

    return API.get(
        `/accounts/groups/${groupId}/messages/`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
};


// Send message
export const sendMessage = (
    accessToken,
    receiverId,
    text
) => {

    return API.post(
        "/accounts/messages/",
        {
            receiver: receiverId,
            text: text,
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
};

// Send group message
export const sendGroupMessage = (
    accessToken,
    groupId,
    text
) => {

    return API.post(
        `/accounts/groups/${groupId}/messages/`,
        {
            text: text,
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
};

// Get notifications
export const getNotifications = (accessToken) => {
    return API.get(
        "/accounts/notifications/",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
};
// Mark all notifications as read
export const markAllNotificationsAsRead = (accessToken) => {
    return API.post(
        "/accounts/notifications/mark-all-read/",
        {},
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
};


export default API;

