import "./DashboardCards.css";
import { FaComments, FaUsers, FaCircle } from "react-icons/fa";

function DashboardCards() {
    const cards = [
        {
            title: "Messages",
            value: 128,
            icon: <FaComments />,
        },
        {
            title: "Groups",
            value: 15,
            icon: <FaUsers />,
        },
        {
            title: "Online",
            value: 23,
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