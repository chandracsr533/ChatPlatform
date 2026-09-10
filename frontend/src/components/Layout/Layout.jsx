import "./Layout.css";

import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

function Layout({
    children,
    darkMode,
    activePage,
    setActivePage,
    handleLogout,
    unreadNotifications,
    setUnreadNotifications,
}) {
    return (

        <div
            className={
                darkMode
                    ? "layout dark"
                    : "layout"
            }
        >

            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                handleLogout={handleLogout}
                unreadNotifications={unreadNotifications}
                setUnreadNotifications={setUnreadNotifications}
            />

            <div className="content">

                <Navbar />

                <div className="page-content">
                    {children}
                </div>

            </div>

        </div>

    );

}

export default Layout;