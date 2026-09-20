import React from "react";
import "../InfoPages.css";

export default function Contact() {
  return (
    <div className="info-page">

      <div className="info-container contact-container">

        {/* HEADER */}
        <div className="info-hero">

          <div className="info-icon">
            🎧
          </div>

          <h1>Contact Us</h1>

          <p>
            We're here to help you with bookings, services, and support.
          </p>

        </div>


        {/* CONTACT CARDS */}
        <div className="contact-grid">

          {/* EMAIL */}
          <div className="contact-card">

            <div className="contact-icon">
              📧
            </div>

            <h3>Email Us</h3>

            <p>
              Have a question or need assistance?
            </p>

            <a href="mailto:hivecare2@gmail.com">
              hivecare2@gmail.com
            </a>

          </div>


          {/* PHONE */}
          <div className="contact-card">

            <div className="contact-icon">
              📞
            </div>

            <h3>Call Us</h3>

            <p>
              Speak directly with our support team.
            </p>

            <a href="tel:+916299186350">
              +91 62991 86350
            </a>

          </div>


          {/* LOCATION */}
          <div className="contact-card">

            <div className="contact-icon">
              📍
            </div>

            <h3>Our Location</h3>

            <p>
              HiveCare Service Center
            </p>

            <strong>
              Bangalore, India
            </strong>

          </div>

        </div>


        {/* SUPPORT BANNER */}
        <div className="support-banner">

          <div className="support-banner-icon">
            💬
          </div>

          <div>

            <h3>Need Help With Your Booking?</h3>

            <p>
              Our support team is ready to assist you with booking,
              payment, service, or account-related questions.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}
