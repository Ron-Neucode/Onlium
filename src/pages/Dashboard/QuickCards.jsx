import "./styles/QuickCards.css";
import { QUICK_CARDS } from "../data/quickCards";
import { NavLink } from "react-router-dom";

export default function QuickCards() {
  return (
    <div className="quick-grid">
      {QUICK_CARDS.map((card) => {
        const content = (
          <div className="quick-card" key={card.title}>
            <div className={`qc-icon ${card.color}`}>{card.icon}</div>
            <div className="qc-title">{card.title}</div>
            <div className="qc-sub">{card.sub}</div>
          </div>
        );

        return card.to ? (
          <NavLink key={card.title} to={card.to} style={{ textDecoration: "none" }}>
            {content}
          </NavLink>
        ) : (
          content
        );
      })}
    </div>
  );
}