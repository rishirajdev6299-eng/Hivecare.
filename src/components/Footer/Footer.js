import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaHeart
} from "react-icons/fa";

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      {/* Decorative background */}
      <div className="footer-glow footer-glow-one"></div>
      <div className="footer-glow footer-glow-two"></div>


      <div className="container">

        {/* =====================================================
            TOP FOOTER
        ===================================================== */}

        <div className="footer-main">


          {/* =================================================
              BRAND
          ================================================= */}

          <div className="footer-brand">

            <Link to="/" className="footer-logo">
              <span className="logo-icon">
                H
              </span>

              <span>
                Hive<span>Care</span>
              </span>
            </Link>


            <p className="footer-description">

              Trusted home services at your fingertips.
              Book verified professionals for plumbing,
              cleaning, electrical work, beauty, wellness
              and more.

            </p>


            {/* SOCIAL ICONS */}

            <div className="footer-social">

              <a
                href="#"
                aria-label="Facebook"
                className="social-icon"
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="social-icon"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="social-icon"
              >
                <FaTwitter />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="social-icon"
              >
                <FaLinkedinIn />
              </a>

            </div>

          </div>


          {/* =================================================
              QUICK LINKS
          ================================================= */}

          <div className="footer-column">

            <h5>
              Quick Links
            </h5>

            <div className="footer-links">

              <Link to="/">
                Home
              </Link>

              <Link to="/services">
                Services
              </Link>

              <Link to="/bookings">
                Book a Service
              </Link>

              <Link to="/history">
                Booking History
              </Link>

            </div>

          </div>


          {/* =================================================
              SUPPORT
          ================================================= */}

          <div className="footer-column">

            <h5>
              Support
            </h5>

            <div className="footer-links">

              <Link to="/contact">
                Contact Us
              </Link>

              <Link to="/about">
                About Us
              </Link>

              <Link to="/privacy">
                Privacy Policy
              </Link>

              <Link to="/services">
                Our Services
              </Link>

            </div>

          </div>


          {/* =================================================
              CONTACT
          ================================================= */}

          <div className="footer-column contact-column">

            <h5>
              Contact Us
            </h5>


            <div className="contact-item">

              <div className="contact-icon">
                <FaEnvelope />
              </div>

              <div>
                <span>Email</span>
                <p>
                  hivecare2@gmail.com
                </p>
              </div>

            </div>


            <div className="contact-item">

              <div className="contact-icon">
                <FaPhoneAlt />
              </div>

              <div>
                <span>Phone</span>
                <p>
                  +91 98520 56217
                </p>
              </div>

            </div>


            <div className="contact-item">

              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>

              <div>
                <span>Location</span>
                <p>
                  Bangalore, India
                </p>
              </div>

            </div>

          </div>

        </div>


        


        {/* =====================================================
            BOTTOM FOOTER
        ===================================================== */}

        <div className="footer-bottom">

          <p>

            © {new Date().getFullYear()}{" "}

            <strong>
              HiveCare
            </strong>

            . All Rights Reserved.

          </p>


          <p className="made-with">

            Made with

            <FaHeart />

            for better home services

          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;