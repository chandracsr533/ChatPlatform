import { useEffect, useState } from "react";
import "./Profile.css";
import { getAvatarGradient, getInitials } from "../../utils/avatar";

function Profile() {
    const [profile, setProfile] = useState({
        username: "",
        email: "",
        profileImage: "",
    });

    const [isEditing, setIsEditing] = useState(false);

    const [editProfile, setEditProfile] = useState({
        username: "",
        email: "",
        profileImage: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const accessToken = localStorage.getItem("accessToken");

            if (!accessToken) {
                console.error("Access token not found");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/api/accounts/profile/",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${accessToken}`,
                        },
                    }
                );

                const data = await response.json();



                if (response.ok) {
                    const userProfile = {
                        username: data.username || "User",
                        email: data.email || "",
                        profileImage: data.profile_image || "",
                    };

                    setProfile(userProfile);
                    setEditProfile(userProfile);

                    localStorage.setItem("username", userProfile.username);
                    if (userProfile.profileImage) {
                        localStorage.setItem("profileImage", userProfile.profileImage);
                    } else {
                        localStorage.removeItem("profileImage");
                    }
                    window.dispatchEvent(new Event("storage"));
                } else {
                    console.error(
                        "Failed to update profile:",
                        JSON.stringify(data, null, 2)
                    );
                }

            } catch (error) {
                console.error(
                    "Profile fetch error:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setEditProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        setEditProfile((prev) => ({
            ...prev,
            profileImage: file,
        }));
    };

    const handleSave = async () => {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            console.error("Access token not found");
            return;
        }
        setSaving(true);
        setMessage("");

        try {
            const formData = new FormData();

            formData.append(
                "username",
                editProfile.username
            );

            formData.append(
                "email",
                editProfile.email
            );

            if (editProfile.profileImage instanceof File) {
                formData.append(
                    "profile_image",
                    editProfile.profileImage
                );
            } else if (!editProfile.profileImage) {
                formData.append("remove_image", "true");
            }

            const response = await fetch(
                "http://127.0.0.1:8000/api/accounts/profile/",
                {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (response.ok) {
                const updatedProfile = {
                    username: data.username,
                    email: data.email,
                    profileImage: data.profile_image || "",
                };

                setProfile(updatedProfile);
                setEditProfile(updatedProfile);

                localStorage.setItem(
                    "username",
                    updatedProfile.username
                );
                if (updatedProfile.profileImage) {
                    localStorage.setItem("profileImage", updatedProfile.profileImage);
                } else {
                    localStorage.removeItem("profileImage");
                }
                window.dispatchEvent(new Event("storage"));

                setIsEditing(false);
                setMessage("Profile updated successfully!");

            } else {
                console.error(
                    "Failed to update profile:",
                    data
                );
                setMessage(
                    data.detail ||
                    "Failed to update profile."
                );
            }

        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );
            setMessage(
                "Something went wrong. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditProfile(profile);
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="profile-page">
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">

            <div className="profile-card">

                <div className="profile-image-container">

                    <div
                        className="profile-image"
                        style={!profile.profileImage ? { background: getAvatarGradient(profile.username) } : {}}
                    >
                        {profile.profileImage ? (
                            <img
                                src={profile.profileImage}
                                alt="Profile"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    const span = e.target.parentElement.querySelector("span");
                                    if (span) span.style.display = "block";
                                    e.target.parentElement.style.background = getAvatarGradient(profile.username);
                                }}
                            />
                        ) : null}
                        <span style={{ display: profile.profileImage ? "none" : "block" }}>
                            {getInitials(profile.username)}
                        </span>
                    </div>

                </div>

                {!isEditing ? (
                    <div className="profile-details">

                        <h2>
                            {profile.username}
                        </h2>

                        <p>
                            {profile.email || "No email available"}
                        </p>

                        <button
                            className="edit-profile-btn"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>

                    </div>
                ) : (
                    <div className="profile-edit-form">

                        <h2>
                            Edit Profile
                        </h2>

                        <div className="form-group">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                name="username"
                                value={editProfile.username}
                                onChange={handleChange}
                                placeholder="Enter username"
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={editProfile.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Profile Picture
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                        </div>

                        {editProfile.profileImage && (
                            <div className="profile-preview">

                                <img
                                    src={
                                        editProfile.profileImage instanceof File
                                            ? URL.createObjectURL(
                                                editProfile.profileImage
                                            )
                                            : editProfile.profileImage
                                    }
                                    alt="Profile Preview"
                                />

                                <button
                                    type="button"
                                    className="remove-profile-btn"
                                    onClick={() =>
                                        setEditProfile((prev) => ({
                                            ...prev,
                                            profileImage: "",
                                        }))
                                    }
                                >
                                    Remove Picture
                                </button>

                            </div>
                        )}

                        <div className="profile-actions">
                            {message && (
                                <p className="profile-message">
                                    {message}
                                </p>
                            )}

                            <button
                                className="save-profile-btn"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>

                            <button
                                className="cancel-profile-btn"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

export default Profile;