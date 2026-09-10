import { useEffect, useState } from "react";
import "./Settings.css";

function Settings({
    setNotificationsEnabled
}) {

    const [notifications, setNotifications] = useState(true);
    const [onlineStatus, setOnlineStatus] = useState(true);
    const [lastSeen, setLastSeen] = useState(true);

    useEffect(() => {

        const savedNotifications =
            localStorage.getItem("notifications");

        const savedOnlineStatus =
            localStorage.getItem("onlineStatus");

        const savedLastSeen =
            localStorage.getItem("lastSeen");

        if (savedNotifications !== null) {
            setNotifications(
                savedNotifications === "true"
            );
        }

        if (savedOnlineStatus !== null) {
            setOnlineStatus(
                savedOnlineStatus === "true"
            );
        }

        if (savedLastSeen !== null) {
            setLastSeen(
                savedLastSeen === "true"
            );
        }

    }, []);


    // Update Online Status in Django
    const handleOnlineStatusChange = async () => {

        const newValue = !onlineStatus;

        // Update React state
        setOnlineStatus(newValue);

        // Save to localStorage
        localStorage.setItem(
            "onlineStatus",
            newValue
        );

        const accessToken =
            localStorage.getItem("accessToken");

        if (!accessToken) {
            console.error(
                "Access token not found"
            );
            return;
        }

        try {

            const response = await fetch(
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
                        is_online: newValue,
                    }),
                }
            );

            const data =
                await response.json();

            console.log(
                "Online Status API response:",
                data
            );

            if (!response.ok) {

                console.error(
                    "Failed to update online status:",
                    data
                );

                // Roll back if API update fails
                setOnlineStatus(!newValue);

                localStorage.setItem(
                    "onlineStatus",
                    !newValue
                );

                return;
            }

            console.log(
                "Online status updated successfully"
            );

        } catch (error) {

            console.error(
                "Online Status API error:",
                error
            );

            // Roll back if request fails
            setOnlineStatus(!newValue);

            localStorage.setItem(
                "onlineStatus",
                !newValue
            );
        }
    };


    return (
        <div className="settings-page">

            <div className="settings-card">

                <div className="settings-header">

                    <h2>Settings</h2>

                    <p>
                        Manage your chat preferences
                    </p>

                </div>


                {/* Notifications */}

                <div className="settings-section">

                    <h3>Notifications</h3>

                    <div className="setting-item">

                        <div className="setting-info">

                            <h4>
                                Notifications
                            </h4>

                            <p>
                                Receive notifications for new messages
                            </p>

                        </div>

                        <label className="switch">

                            <input
                                type="checkbox"
                                checked={notifications}
                                onChange={() => {

                                    const newValue =
                                        !notifications;

                                    // Update Settings state
                                    setNotifications(
                                        newValue
                                    );

                                    // Save in browser
                                    localStorage.setItem(
                                        "notifications",
                                        newValue
                                    );

                                    // Update Dashboard state immediately
                                    setNotificationsEnabled(
                                        newValue
                                    );
                                }}
                            />

                            <span className="slider"></span>

                        </label>

                    </div>

                </div>


                {/* Privacy */}

                <div className="settings-section">

                    <h3>Privacy</h3>


                    {/* Online Status */}

                    <div className="setting-item">

                        <div className="setting-info">

                            <h4>
                                Online Status
                            </h4>

                            <p>
                                Allow others to see when you are online
                            </p>

                        </div>

                        <label className="switch">

                            <input
                                type="checkbox"
                                checked={onlineStatus}
                                onChange={
                                    handleOnlineStatusChange
                                }
                            />

                            <span className="slider"></span>

                        </label>

                    </div>


                    {/* Last Seen */}

                    <div className="setting-item">

                        <div className="setting-info">

                            <h4>
                                Last Seen
                            </h4>

                            <p>
                                Allow others to see your last seen time
                            </p>

                        </div>

                        <label className="switch">

                            <input
                                type="checkbox"
                                checked={lastSeen}
                                onChange={async () => {

                                    const newValue =
                                        !lastSeen;

                                    // Update React state
                                    setLastSeen(newValue);

                                    // Save to localStorage
                                    localStorage.setItem(
                                        "lastSeen",
                                        newValue
                                    );

                                    const accessToken =
                                        localStorage.getItem(
                                            "accessToken"
                                        );

                                    if (!accessToken) {

                                        console.error(
                                            "Access token not found"
                                        );

                                        return;
                                    }

                                    try {

                                        const response =
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
                                                        allow_last_seen:
                                                            newValue,
                                                    }),
                                                }
                                            );

                                        const data =
                                            await response.json();

                                        console.log(
                                            "Last Seen API response:",
                                            data
                                        );

                                        if (!response.ok) {

                                            console.error(
                                                "Failed to update Last Seen:",
                                                data
                                            );

                                            // Roll back UI
                                            setLastSeen(
                                                !newValue
                                            );

                                            localStorage.setItem(
                                                "lastSeen",
                                                !newValue
                                            );

                                            return;
                                        }

                                        console.log(
                                            "Last Seen updated successfully"
                                        );

                                    } catch (error) {

                                        console.error(
                                            "Last Seen API error:",
                                            error
                                        );

                                        // Roll back UI
                                        setLastSeen(
                                            !newValue
                                        );

                                        localStorage.setItem(
                                            "lastSeen",
                                            !newValue
                                        );
                                    }
                                }}
                            />

                            <span className="slider"></span>

                        </label>

                    </div>

                </div>

            </div>

        </div>
    );

}

export default Settings;
