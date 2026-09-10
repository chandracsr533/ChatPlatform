import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/accounts/login/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                const accessToken = data.access;

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", data.refresh);
                localStorage.setItem("username", username);

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

                console.log("Login successful");

                navigate("/dashboard");
            } else {
                console.error("Login failed:", data);
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;


// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// function Login() {
//     const navigate = useNavigate();
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");


//     const handleLogin = async (e) => {
//         e.preventDefault();

//         try {
//             const response = await fetch(
//                 "http://127.0.0.1:8000/api/accounts/login/",
//                 {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify({
//                         username: username,
//                         password: password,
//                     }),
//                 }
//             );

//             const data = await response.json();

//             if (response.ok) {
//                 localStorage.setItem("accessToken", data.access);
//                 localStorage.setItem("refreshToken", data.refresh);
//                 localStorage.setItem("username", username);

//                 console.log("Login successful");

//                 navigate("/dashboard");
//             } else {
//                 console.error("Login failed:", data);
//             }

//         } catch (error) {
//             console.error("Login error:", error);
//         }
//     };

//     return (
//         <div className="login-container">

//             <div className="login-box">

//                 <h2>Login</h2>

//                 <form onSubmit={handleLogin}>

//                     <div className="form-group">
//                         <label>Username</label>

//                         <input
//                             type="text"
//                             placeholder="Enter username"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                         />
//                     </div>

//                     <div className="form-group">
//                         <label>Password</label>

//                         <input
//                             type="password"
//                             placeholder="Enter password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                         />
//                     </div>

//                     <button type="submit">
//                         Login
//                     </button>

//                 </form>

//             </div>

//         </div>
//     );
// }

// export default Login;