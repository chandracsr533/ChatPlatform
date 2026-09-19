import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !password) {
            setError("Please enter both username and password.");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                "http://127.0.0.1:8000/api/accounts/login/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username.trim(),
                        password: password,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                const accessToken = data.access;
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", data.refresh);
                localStorage.setItem("username", username.trim());
                localStorage.removeItem("profileImage");

                try {
                    const profileRes = await fetch(
                        "http://127.0.0.1:8000/api/accounts/profile/",
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        }
                    );
                    if (profileRes.ok) {
                        const profileData = await profileRes.json();
                        if (profileData.profile_image) {
                            localStorage.setItem("profileImage", profileData.profile_image);
                        }
                    }
                } catch (pErr) {
                    console.error("Profile prefetch error:", pErr);
                }

                try {
                    await fetch(
                        "http://127.0.0.1:8000/api/accounts/status/",
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({
                                is_online: true,
                            }),
                        }
                    );
                } catch (statusError) {
                    console.error(
                        "Failed to update online status:",
                        statusError
                    );
                }

                navigate("/dashboard");
            } else {
                setError(
                    data.detail ||
                    data.error ||
                    "Invalid username or password. Please try again."
                );
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "Unable to connect to server. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Enter your credentials to access your account</p>
                </div>

                {error && <div className="auth-alert error">{error}</div>}

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (error) setError("");
                            }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError("");
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register" className="auth-link">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;