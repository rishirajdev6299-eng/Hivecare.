
import React from "react";
import { Link } from "react-router-dom";
import "./ServiceCard.css";

function ServiceCard({ title, description, icon }) {
  return (
    <div className="service-card">

      {/* ICON - hidden by Services.css because outer card already has icon */}
      <div className="services-icon">
        {icon}
      </div>

      {/* TITLE */}
      <h5>{title}</h5>

      {/* DESCRIPTION */}
      <p>{description}</p>

      {/* ONLY ONE BOOK NOW BUTTON */}
      <Link
        to="/bookings"
        state={{ service: title }}
        className="service-book-btn"
      >
        <span>Book Now</span>
        <i className="bi bi-arrow-up-right"></i>
      </Link>

    </div>
  );
}

export default ServiceCard;

