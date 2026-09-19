import { useEffect, useState } from "react";
import "./DashboardCards.css";
import { FaComments, FaUsers, FaCircle } from "react-icons/fa";
import { getDashboardStats } from "../../services/api";

function DashboardCards() {
    const [stats, setStats] = useState({
        messages: 0,
        groups: 0,
        online: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) return;

            try {
                const response = await getDashboardStats(accessToken);
                setStats({
                    messages: response.data.messages_count,
                    groups: response.data.groups_count,
                    online: response.data.online_users_count,
                });
            } catch (err) {
                console.error("Failed to fetch dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const cards = [
        {
            title: "Messages",
            value: loading ? "..." : stats.messages,
            icon: <FaComments />,
        },
        {
            title: "Groups",
            value: loading ? "..." : stats.groups,
            icon: <FaUsers />,
        },
        {
            title: "Online",
            value: loading ? "..." : stats.online,
            icon: <FaCircle />,
        },
    ];

    return (
        <div className="dashboard-cards">
            {cards.map((card, index) => (
                <div className="card-box" key={index}>
                    <div>
                        <h5>{card.title}</h5>
                        <h2>{card.value}</h2>
                    </div>

                    <div className="card-icon">
                        {card.icon}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default DashboardCards;
