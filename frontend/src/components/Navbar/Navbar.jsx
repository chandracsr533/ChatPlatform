import "./Navbar.css";
import profile from "../../assets/images/profile.jpg";

import {
    FaBars,
    FaSearch,
    FaBell,
    FaCog,
} from "react-icons/fa";

function Navbar() {
    return (
        <div className="navbar">

            {/* Left Section */}
            <div className="navbar-left">
                <FaBars className="menu-icon" />

                <h3>Dashboard</h3>
            </div>

            {/* Center Section */}
            <div className="search-box">
                <FaSearch className="search-icon" />

                <input
                    type="text"
                    placeholder="Search users or chats..."
                />
            </div>

            {/* Right Section */}
            <div className="navbar-right">

                <FaBell className="nav-icon" />

                <FaCog className="nav-icon" />

                <div className="profile">

                    <img
                        src={profile}
                        alt="Profile"
                        className="profile-img"
                    />

                    <span>Chandra</span>

                </div>

            </div>

        </div>
    );
}

export default Navbar;