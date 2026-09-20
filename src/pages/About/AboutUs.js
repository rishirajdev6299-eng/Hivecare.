import React from "react";
import "../InfoPages.css";

export default function AboutUs() {
  return (
    <div className="info-page">

      <div className="info-container">

        {/* HEADER */}
        <div className="info-hero">

          <div className="info-icon">
            🏠
          </div>

          <h1>About HiveCare</h1>

          <p>
            Making professional home services simple, reliable, and
            accessible.
          </p>

        </div>


        {/* CONTENT */}
        <div className="info-content">

          <section>
            <h2>Who We Are</h2>

            <p>
              <strong>HiveCare</strong> is a modern home-service platform
              designed to connect customers with trusted professionals.
              Our goal is to make it easier for people to find, book,
              and manage professional services from the comfort of
              their homes.
            </p>

            <p>
              From plumbing and electrical repairs to cleaning, tutoring,
              fitness, beauty, pet care, and other everyday services,
              HiveCare brings multiple services together in one
              convenient platform.
            </p>
          </section>


          <section>
            <h2>Our Mission</h2>

            <p>
              Our mission is to simplify the process of finding reliable
              home-service professionals while providing customers with
              a smooth and convenient booking experience.
            </p>
          </section>


          {/* VALUES */}
          <div className="values-grid">

            <div className="value-card">

              <div className="value-icon">
                🤝
              </div>

              <h3>Trusted Professionals</h3>

              <p>
                We aim to connect customers with reliable and
                professional service providers.
              </p>

            </div>


            <div className="value-card">

              <div className="value-icon">
                ⚡
              </div>

              <h3>Easy Booking</h3>

              <p>
                Find and book the service you need quickly and
                conveniently.
              </p>

            </div>


            <div className="value-card">

              <div className="value-icon">
                💰
              </div>

              <h3>Transparent Pricing</h3>

              <p>
                We believe customers should have clear information
                about service prices before booking.
              </p>

            </div>


            <div className="value-card">

              <div className="value-icon">
                ❤️
              </div>

              <h3>Customer First</h3>

              <p>
                We focus on creating a reliable and satisfying
                experience for every customer.
              </p>

            </div>

          </div>


          <section>
            <h2>Why HiveCare?</h2>

            <p>
              We believe that getting help at home should be simple,
              safe, and stress-free. HiveCare combines technology,
              professional services, and customer-focused support to
              create a convenient platform for everyday home-service
              needs.
            </p>

            <p>
              Whether you need a plumber, electrician, maid, tutor,
              babysitter, pet sitter, yoga instructor, carpenter,
              gym trainer, or beautician, HiveCare helps bring the
              service to your doorstep.
            </p>
          </section>

        </div>

      </div>

    </div>
  );
}