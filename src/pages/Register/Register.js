import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/api";
import "./Register.css";

import {
  APIProvider,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

// ============================================================
// GOOGLE MAPS API KEY
// ============================================================
// Put your Google Maps API key directly here.
// No .env file is required.
//
// IMPORTANT:
// Use a NEW/restricted key instead of a key that has been
// publicly exposed.
//
// ============================================================

const GOOGLE_MAPS_API_KEY =
  "AIzaSyAz4-kvt2eeQnN-l7ocOV9_StxWqF3tqaY";


// ============================================================
// GOOGLE ADDRESS SEARCH
// ============================================================

function RegisterLocationSearch({ value, onChange }) {
  const places = useMapsLibrary("places");

  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = async (event) => {
    const text = event.target.value;

    setInputValue(text);
    onChange(text);

    if (!places || text.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response =
        await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: text,
          includedRegionCodes: ["in"],
        });

      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error(
        "Google Places autocomplete error:",
        error
      );

      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (suggestion) => {
    try {
      const prediction = suggestion.placePrediction;

      if (!prediction) {
        return;
      }

      const place = prediction.toPlace();

      await place.fetchFields({
        fields: ["formattedAddress"],
      });

      const address =
        place.formattedAddress ||
        prediction.text?.text ||
        inputValue;

      setInputValue(address);
      setSuggestions([]);

      // Only address is sent
      onChange(address);
    } catch (error) {
      console.error(
        "Unable to select address:",
        error
      );
    }
  };

  return (
    <div
      className="register-location-search"
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <textarea
        id="register-address"
        name="address"
        placeholder="Search your address"
        value={inputValue}
        onChange={handleChange}
        rows="3"
        autoComplete="street-address"
        required
      />

      {/* Loading indicator - does NOT change layout */}
      {loading && (
        <div
          style={{
            position: "absolute",
            right: "12px",
            top: "10px",
            fontSize: "11px",
            color: "#777",
            pointerEvents: "none",
            background: "#fff",
            padding: "2px 4px",
            borderRadius: "4px",
          }}
        >
          Searching...
        </div>
      )}

      {/* Suggestions - positioned OVER the page */}
      {suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow:
              "0 5px 18px rgba(0,0,0,0.15)",
            zIndex: 99999,
            overflow: "hidden",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {suggestions.map((suggestion, index) => {
            const prediction =
              suggestion.placePrediction;

            if (!prediction) {
              return null;
            }

            return (
              <button
                type="button"
                key={
                  prediction.placeId || index
                }
                onClick={() =>
                  handleSelect(suggestion)
                }
                style={{
                  display: "block",
                  width: "100%",
                  padding: "11px 14px",
                  border: "none",
                  borderBottom:
                    "1px solid #eeeeee",
                  background: "#ffffff",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontWeight: "600",
                    color: "#222",
                    fontSize: "14px",
                  }}
                >
                  {prediction.mainText?.text ||
                    prediction.text?.text ||
                    "Address"}
                </div>

                {prediction.secondaryText?.text && (
                  <div
                    style={{
                      marginTop: "3px",
                      fontSize: "12px",
                      color: "#777",
                    }}
                  >
                    {prediction.secondaryText.text}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// REGISTER COMPONENT
// ============================================================

function Register() {

  const navigate =
    useNavigate();


  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
    });


  // ==========================================================
  // ERROR STATE
  // ==========================================================

  const [emailError, setEmailError] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");


  // ==========================================================
  // NOTIFICATION STATE
  // ==========================================================

  const [notification, setNotification] =
    useState({
      show: false,
      type: "",
      message: "",
    });


  // ==========================================================
  // PASSWORD VISIBILITY
  // ==========================================================

  const [showPassword, setShowPassword] =
    useState(false);


  // ==========================================================
  // LOADING
  // ==========================================================

  const [loading, setLoading] =
    useState(false);


  // ==========================================================
  // SHOW NOTIFICATION
  // ==========================================================

  const showNotification =
    (type, message) => {

      setNotification({
        show: true,
        type,
        message,
      });


      setTimeout(() => {

        setNotification({
          show: false,
          type: "",
          message: "",
        });

      }, 3000);

    };


  // ==========================================================
  // HANDLE NORMAL INPUT
  // ==========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData({
      ...formData,
      [name]: value,
    });


    if (name === "email") {

      setEmailError("");

    }


    setErrorMessage("");

  };


  // ==========================================================
  // HANDLE REGISTRATION
  // ==========================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setEmailError("");
      setErrorMessage("");
      setLoading(true);


      try {

        // ====================================================
        // SEND REGISTRATION DATA
        // ====================================================
        //
        // Only the address string is sent.
        //
        // No latitude.
        // No longitude.
        //
        // ====================================================

        const response =
          await registerUser({

            name:
              formData.name,

            email:
              formData.email,

            password:
              formData.password,

            phone:
              formData.phone,

            address:
              formData.address,

          });


        // console.log(
        //   "Registration successful:",
        //   response.data
        // );


        // ====================================================
        // SUCCESS NOTIFICATION
        // ====================================================

        showNotification(
          "success",
          "Registration successful..!"
        );


        // ====================================================
        // RESET FORM
        // ====================================================

        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          password: "",
        });


        // ====================================================
        // REDIRECT TO LOGIN
        // ====================================================

        setTimeout(() => {

          navigate(
            "/login",
            {
              replace: true,
            }
          );

        }, 1800);

      } catch (error) {

        console.error(
          "Registration Error:",
          error
        );


        // ====================================================
        // EMAIL ALREADY EXISTS
        // ====================================================

        if (
          error.response &&
          error.response.data ===
            "Email already exists"
        ) {

          setEmailError(
            "This email is already registered."
          );


          showNotification(
            "error",
            "This email is already registered."
          );

        }

        // ====================================================
        // OTHER ERROR
        // ====================================================

        else {

          const message =
            typeof error.response?.data ===
            "string"
              ? error.response.data
              : "Registration failed. Please try again.";


          setErrorMessage(message);


          showNotification(
            "error",
            message
          );

        }

      } finally {

        setLoading(false);

      }

    };


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
    >

      <div className="hive-register-page">


        {/* ==================================================
            NOTIFICATION
        ================================================== */}

        {notification.show && (

          <div
            className={`hive-register-notification ${
              notification.type === "success"
                ? "success"
                : "error"
            }`}
          >

            <div className="hive-notification-icon">

              {notification.type ===
              "success"
                ? "✓"
                : "⚠"}

            </div>


            <div className="hive-notification-content">

              <strong>

                {notification.type ===
                "success"
                  ? "Success"
                  : "Error"}

              </strong>


              <span>

                {notification.message}

              </span>

            </div>


            <button
              type="button"
              className="hive-notification-close"
              onClick={() =>
                setNotification({
                  show: false,
                  type: "",
                  message: "",
                })
              }
            >
              ×
            </button>

          </div>

        )}


        <div className="hive-register-wrapper">


          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="hive-register-intro">


            <div className="hive-register-logo">
              H
            </div>


            <h1>
              Join <span>HiveCare</span>
            </h1>


            <p>
              Create your account and get access to
              trusted professionals for all your
              home service needs.
            </p>


            {/* FEATURES */}

            <div className="hive-register-features">


              <div className="hive-register-feature">

                <div className="hive-register-feature-icon">
                  ✓
                </div>

                <div>

                  <strong>
                    Trusted Professionals
                  </strong>

                  <small>
                    Connect with verified service experts.
                  </small>

                </div>

              </div>


              <div className="hive-register-feature">

                <div className="hive-register-feature-icon">
                  ✓
                </div>

                <div>

                  <strong>
                    Simple Booking
                  </strong>

                  <small>
                    Find and book services easily.
                  </small>

                </div>

              </div>


              <div className="hive-register-feature">

                <div className="hive-register-feature-icon">
                  ✓
                </div>

                <div>

                  <strong>
                    Secure Account
                  </strong>

                  <small>
                    Your information stays protected.
                  </small>

                </div>

              </div>


            </div>


            {/* BOTTOM MESSAGE */}

            <div className="hive-register-quote">

              <span>
                "
              </span>

              Making home services
              simple, reliable and convenient.

            </div>


          </div>


          {/* =================================================
              REGISTER CARD
          ================================================= */}

          <div className="hive-register-card">


            {/* HEADING */}

            <div className="hive-register-heading">

              <span className="hive-register-badge">
                CREATE ACCOUNT
              </span>


              <h2>
                Get Started 🚀
              </h2>


              <p>
                Create your HiveCare account in
                just a few steps.
              </p>

            </div>


            {/* GENERAL ERROR */}

            {errorMessage && (

              <div className="hive-register-error">

                <span>
                  ⚠
                </span>

                <span>
                  {errorMessage}
                </span>

              </div>

            )}


            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>


              {/* =================================================
                  NAME
              ================================================= */}

              <div className="hive-register-field">

                <label htmlFor="register-name">
                  Full Name
                </label>


                <div className="hive-register-input">

                  <span>
                    👤
                  </span>


                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />

                </div>

              </div>


              {/* =================================================
                  EMAIL
              ================================================= */}

              <div className="hive-register-field">

                <label htmlFor="register-email">
                  Email Address
                </label>


                <div
                  className={`hive-register-input ${
                    emailError
                      ? "hive-register-input-error"
                      : ""
                  }`}
                >

                  <span>
                    ✉
                  </span>


                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />

                </div>


                {emailError && (

                  <small className="hive-register-email-error">

                    ⚠ {emailError}

                  </small>

                )}

              </div>


              {/* =================================================
                  PHONE
              ================================================= */}

              <div className="hive-register-field">

                <label htmlFor="register-phone">
                  Phone Number
                </label>


                <div className="hive-register-input">

                  <span>
                    📱
                  </span>


                  <input
                    id="register-phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                  />

                </div>

              </div>


              {/* =================================================
                  ADDRESS
              ================================================= */}

              <div className="hive-register-field">

                <label htmlFor="register-address">
                  Address
                </label>


                <div className="hive-register-textarea">

                  <span>
                    📍
                  </span>


                  <RegisterLocationSearch
                    value={formData.address}
                    onChange={(address) => {

                      setFormData(
                        (previous) => ({
                          ...previous,
                          address: address,
                        })
                      );

                      setErrorMessage("");

                    }}
                  />

                </div>

              </div>


              {/* =================================================
                  PASSWORD
              ================================================= */}

              <div className="hive-register-field">

                <label htmlFor="register-password">
                  Password
                </label>


                <div className="hive-register-input">

                  <span>
                    🔒
                  </span>


                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />


                  <button
                    type="button"
                    className="hive-register-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >

                    {showPassword
                      ? "🙈"
                      : "👁"}

                  </button>

                </div>

              </div>


              {/* =================================================
                  SUBMIT BUTTON
              ================================================= */}

              <button
                type="submit"
                className="hive-register-button"
                disabled={loading}
              >

                {loading ? (

                  <>

                    <span className="hive-register-spinner"></span>

                    Creating Account...

                  </>

                ) : (

                  <>

                    Create Account

                    <span className="hive-register-arrow">
                      →
                    </span>

                  </>

                )}

              </button>


            </form>


            {/* =================================================
                LOGIN
            ================================================= */}

            <div className="hive-register-login">

              <span>
                Already have an account?
              </span>


              <Link to="/login">
                Sign In
              </Link>

            </div>


            {/* =================================================
                SECURITY
            ================================================= */}

            <div className="hive-register-security">

              🔐 Your information is securely protected

            </div>


          </div>


        </div>


      </div>

    </APIProvider>

  );

}


export default Register;