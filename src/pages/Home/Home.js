import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReviews } from "../../api/api";
import {

  FaCheckCircle,
  FaCalendarCheck,
  FaRupeeSign,
  FaHeadset,
  FaArrowRight,
  FaStar,
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaTools
} from "react-icons/fa";

import "./Home.css";

import homeHeroImg from "../../assets/images/hero.png";
import plumberImg from "../../assets/images/plumber.jpg";
import yogaImg from "../../assets/images/yoga.jpg";
import beauticianImg from "../../assets/images/beautician.jpg";

function Home() {
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    let mounted = true;

    getReviews()
      .then((response) => {
        if (!mounted) return;
        const data = Array.isArray(response?.data) ? response.data : [];
        setReviews(data);
      })
      .catch((error) => {
        console.error("Unable to load customer reviews:", error);
        if (mounted) setReviews([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const reviewName = (review) =>
    review?.customerName ||
    review?.customer ||
    review?.userName ||
    review?.name ||
    "Customer";

  const reviewText = (review) =>
    review?.comment ||
    review?.review ||
    review?.feedback ||
    "Great service!";

  const reviewRating = (review) =>
    Math.max(
      0,
      Math.min(
        5,
        Number(review?.rating || 0)
      )
    );


  return (
    <div className="home-page">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="hero-section">

        <img
          src={homeHeroImg}
          alt="Hive Care Home Services"
          className="hero-image"
        />

        <div className="hero-overlay"></div>

        <div className="container hero-container">

          <div className="hero-content">

            <div className="hero-badge">
              <FaStar />
              <span>Trusted Home Services</span>
            </div>

            <h1>
              Professional Services
              <br />
              <span>At Your Doorstep</span>
            </h1>

            <p>
              Book trusted professionals for plumbing, cleaning,
              beauty, wellness, tutoring and many more services —
              all from the comfort of your home.
            </p>

            <div className="hero-buttons">

              <Link
                to="/services"
                className="hero-primary-btn"
              >
                Explore Services
                <FaArrowRight />
              </Link>

              <Link
                to="/bookings"
                className="hero-secondary-btn"
              >
                Book a Service
              </Link>

            </div>

            {/* HERO TRUST */}

            <div className="hero-trust">

              <div className="trust-item">
                <FaCheckCircle />
                <span>Verified Professionals</span>
              </div>

              <div className="trust-item">
                <FaShieldAlt />
                <span>Safe & Reliable</span>
              </div>

              <div className="trust-item">
                <FaClock />
                <span>Quick Booking</span>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          WHY CHOOSE US
      ===================================================== */}

      <section className="why-section">

        <div className="container">

          <div className="section-heading">

            <span className="section-label">
              WHY HIVECARE?
            </span>

            <h2>
              Everything You Need,
              <span> One Place</span>
            </h2>

            <p>
              We make finding and booking reliable home
              professionals simple, fast and convenient.
            </p>

          </div>


          <div className="row g-4">

            {/* CARD 1 */}

            <div className="col-lg-3 col-md-6">

              <div className="feature-card">

                <div className="feature-icon">
                  <FaCheckCircle />
                </div>

                <h4>Verified Experts</h4>

                <p>
                  Connect with trusted and verified
                  professionals for your needs.
                </p>

                <div className="feature-number">
                  01
                </div>

              </div>

            </div>


            {/* CARD 2 */}

            <div className="col-lg-3 col-md-6">

              <div className="feature-card">

                <div className="feature-icon">
                  <FaCalendarCheck />
                </div>

                <h4>Easy Booking</h4>

                <p>
                  Schedule your service in just a few
                  simple clicks.
                </p>

                <div className="feature-number">
                  02
                </div>

              </div>

            </div>


            {/* CARD 3 */}

            <div className="col-lg-3 col-md-6">

              <div className="feature-card">

                <div className="feature-icon">
                  <FaRupeeSign />
                </div>

                <h4>Affordable Pricing</h4>

                <p>
                  Enjoy transparent pricing with
                  no hidden surprises.
                </p>

                <div className="feature-number">
                  03
                </div>

              </div>

            </div>


            {/* CARD 4 */}

            <div className="col-lg-3 col-md-6">

              <div className="feature-card">

                <div className="feature-icon">
                  <FaHeadset />
                </div>

                <h4>24/7 Support</h4>

                <p>
                  Our support team is here whenever
                  you need assistance.
                </p>

                <div className="feature-number">
                  04
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          POPULAR SERVICES
      ===================================================== */}

      <section className="services-section">

        <div className="container">

          <div className="section-heading">

            <span className="section-label">
              OUR SERVICES
            </span>

            <h2>
              Popular Services
              <span> For Your Home</span>
            </h2>

            <p>
              Get professional help whenever you need it.
            </p>

          </div>


          <div className="row g-4">


            {/* PLUMBER */}

            <div className="col-lg-4 col-md-6">

              <div className="service-preview-card">

                <div className="service-image-wrapper">

                  <img
                    src={plumberImg}
                    alt="Plumbing Services"
                  />

                  <div className="service-overlay">
                    <FaTools />
                  </div>

                </div>

                <div className="service-content">

                  <div className="service-rating">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />

                    <span>5.0</span>
                  </div>

                  <h4>Plumbing Solutions</h4>

                  <p>
                    Quick repairs, leak fixing and
                    professional plumbing installations.
                  </p>

                  <Link to="/services">
                    View Service
                    <FaArrowRight />
                  </Link>

                </div>

              </div>

            </div>


            {/* YOGA */}

            <div className="col-lg-4 col-md-6">

              <div className="service-preview-card">

                <div className="service-image-wrapper">

                  <img
                    src={yogaImg}
                    alt="Yoga and Wellness"
                  />

                  <div className="service-overlay">
                    <FaStar />
                  </div>

                </div>

                <div className="service-content">

                  <div className="service-rating">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />

                    <span>5.0</span>
                  </div>

                  <h4>Yoga & Wellness</h4>

                  <p>
                    Personalized yoga sessions with
                    experienced wellness instructors.
                  </p>

                  <Link to="/services">
                    View Service
                    <FaArrowRight />
                  </Link>

                </div>

              </div>

            </div>


            {/* BEAUTICIAN */}

            <div className="col-lg-4 col-md-6">

              <div className="service-preview-card">

                <div className="service-image-wrapper">

                  <img
                    src={beauticianImg}
                    alt="Beauty and Grooming"
                  />

                  <div className="service-overlay">
                    <FaStar />
                  </div>

                </div>

                <div className="service-content">

                  <div className="service-rating">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />

                    <span>5.0</span>
                  </div>

                  <h4>Beauty & Grooming</h4>

                  <p>
                    Enjoy professional beauty and
                    grooming services at home.
                  </p>

                  <Link to="/services">
                    View Service
                    <FaArrowRight />
                  </Link>

                </div>

              </div>

            </div>

          </div>


          {/* SERVICES BUTTON */}

          <div className="services-more">

            <Link
              to="/services"
              className="view-all-btn"
            >
              View All Services
              <FaArrowRight />
            </Link>

          </div>

        </div>


        {/* CUSTOMER REVIEWS */}
        <section className="home-reviews-section">
          <div className="home-reviews-heading">
            <span className="home-reviews-label">CUSTOMER FEEDBACK</span>
            <h2>What Our Customers Say</h2>
            <p>
              Real experiences from people who booked services through HiveCare.
            </p>
          </div>

          {reviews.length > 0 ? (
            <>
              <div className="home-reviews-grid">
                {reviews.slice(0, 6).map((review) => (
                  <article className="home-review-card" key={review.id}>
                    <div className="home-review-top">
                      <div className="home-review-avatar">
                        {reviewName(review).charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <strong>{reviewName(review)}</strong>
                        <span>
                          {review.service || "HiveCare Service"}
                        </span>
                      </div>
                    </div>

                    <div
                      className="home-review-stars"
                      aria-label={`${reviewRating(review)} out of 5`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= reviewRating(review) ? "filled" : ""
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <p>{reviewText(review)}</p>

                    {review.createdAt && (
                      <small>
                        {new Date(
                          review.createdAt
                        ).toLocaleDateString()}
                      </small>
                    )}
                  </article>
                ))}
              </div>

              {/* VIEW ALL REVIEWS BUTTON */}
              {reviews.length > 6 && (
                <div className="services-more">
                  <button
                    type="button"
                    className="view-all-btn"
                    onClick={() => setShowAllReviews(true)}
                  >
                    View All Reviews
                    <FaArrowRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="home-reviews-empty">
              <h3>No customer reviews yet</h3>
              <p>
                Reviews from completed services will appear here.
              </p>
            </div>
          )}
        </section>

      </section>
      {showAllReviews && (
        <div
          className="home-reviews-modal-overlay"
          onClick={() => setShowAllReviews(false)}
        >
          <div
            className="home-reviews-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="home-reviews-modal-header">
              <div>
                <span className="home-reviews-label">
                  CUSTOMER FEEDBACK
                </span>

                <h2>All Customer Reviews</h2>

                <p>
                  {reviews.length} customer reviews
                </p>
              </div>

              <button
                type="button"
                className="home-reviews-modal-close"
                onClick={() => setShowAllReviews(false)}
              >
                ×
              </button>
            </div>

            <div className="home-reviews-modal-body">
              <div className="home-reviews-grid">
                {reviews.map((review) => (
                  <article
                    className="home-review-card"
                    key={review.id}
                  >
                    <div className="home-review-top">
                      <div className="home-review-avatar">
                        {reviewName(review)
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {reviewName(review)}
                        </strong>

                        <span>
                          {review.service ||
                            "HiveCare Service"}
                        </span>
                      </div>
                    </div>

                    <div className="home-review-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= reviewRating(review)
                              ? "filled"
                              : ""
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <p>
                      {reviewText(review)}
                    </p>

                    {review.createdAt && (
                      <small>
                        {new Date(
                          review.createdAt
                        ).toLocaleDateString()}
                      </small>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="stats-section">

        <div className="stats-background"></div>

        <div className="container">

          <div className="stats-wrapper">


            <div className="stat-box">

              <div className="stat-icon">
                <FaCalendarCheck />
              </div>

              <div>
                <h2>10K+</h2>
                <p>Bookings Completed</p>
              </div>

            </div>


            <div className="stat-box">

              <div className="stat-icon">
                <FaUsers />
              </div>

              <div>
                <h2>500+</h2>
                <p>Professionals</p>
              </div>

            </div>


            <div className="stat-box">

              <div className="stat-icon">
                <FaStar />
              </div>

              <div>
                <h2>98%</h2>
                <p>Customer Satisfaction</p>
              </div>

            </div>


            <div className="stat-box">

              <div className="stat-icon">
                <FaHeadset />
              </div>

              <div>
                <h2>24/7</h2>
                <p>Customer Support</p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="final-cta">

        <div className="container">

          <div className="cta-card">

            <div className="cta-content">

              <span className="cta-label">
                NEED A SERVICE?
              </span>

              <h2>
                Your Home Deserves
                <br />
                <span>The Best Care</span>
              </h2>

              <p>
                Find trusted professionals and book
                your service today.
              </p>

              <Link
                to="/services"
                className="cta-button"
              >
                Get Started
                <FaArrowRight />
              </Link>

            </div>


            <div className="cta-decoration">

              <div className="circle circle-one"></div>
              <div className="circle circle-two"></div>
              <div className="circle circle-three"></div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;