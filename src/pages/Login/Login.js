import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  loginUser,
  getCurrentUser,
  forgotPassword
} from "../../api/api";
import "./Login.css";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // =====================================================
  // STATES
  // =====================================================

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [loginLocked, setLoginLocked] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);

  // =====================================================
  // NOTIFICATION
  // =====================================================

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    message: ""
  });

  // =====================================================
  // SHOW NOTIFICATION
  // =====================================================

  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
  };

  // =====================================================
  // AUTO HIDE NOTIFICATION
  // =====================================================

  useEffect(() => {
    if (!notification.show) {
      return;
    }

    const timer = setTimeout(() => {
      setNotification({
        show: false,
        type: "success",
        title: "",
        message: ""
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, [notification.show]);

  // =====================================================
  // CLOSE NOTIFICATION
  // =====================================================

  const closeNotification = () => {
    setNotification({
      show: false,
      type: "success",
      title: "",
      message: ""
    });
  };

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      showNotification(
        "warning",
        "Email Required",
        "Please enter your registered email address."
      );

      return;
    }

    setForgotLoading(true);

    try {
      await forgotPassword(forgotEmail.trim());

      showNotification(
        "success",
        "Email Sent",
        "If your email is registered, a password reset link has been sent."
      );

      setForgotEmail("");

      setTimeout(() => {
        setShowForgotPassword(false);
      }, 1500);

    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      const message =
        error.response?.data ||
        "Unable to send password reset email.";

      showNotification(
        "error",
        "Request Failed",
        typeof message === "string"
          ? message
          : "Unable to send password reset email."
      );

    } finally {
      setForgotLoading(false);
    }
  };

  // =====================================================
  // LOGIN LOCK COUNTDOWN
  // =====================================================

  useEffect(() => {
    if (!loginLocked || lockSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setLockSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);

          setLoginLocked(false);
          setErrorMessage("");

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loginLocked, lockSeconds]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrorMessage("");
  };

  // =====================================================
  // NORMAL EMAIL/PASSWORD LOGIN
  // 3 WRONG ATTEMPTS = 30 SECOND LOCK
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===================================================
    // CHECK FRONTEND LOCK
    // ===================================================

    if (loginLocked) {
      showNotification(
        "warning",
        "Login Temporarily Locked",
        `Please wait ${lockSeconds} seconds before trying again.`
      );

      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      // =================================================
      // LOGIN API
      // =================================================

      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password
      });

      // =================================================
      // GET JWT
      // =================================================

      const token = response.data?.token;

      if (!token) {
        throw new Error(
          "No authentication token received from server."
        );
      }

      // =================================================
      // SAVE ONLY JWT
      // =================================================

      localStorage.setItem(
        "token",
        token
      );

      // =================================================
      // ASK BACKEND / MYSQL FOR CURRENT USER
      // =================================================

      const currentUser = await refreshUser();

      if (!currentUser) {
        throw new Error(
          "Login succeeded but the server could not authenticate the session."
        );
      }

      // =================================================
      // ROLE FROM MYSQL / BACKEND
      // =================================================

      const role = String(
        currentUser.role || ""
      )
        .trim()
        .toUpperCase();

      // =================================================
      // LOGIN SUCCESS
      // =================================================

      setLoginLocked(false);
      setLockSeconds(0);

      showNotification(
        "success",
        "Login Successful",
        `Welcome back, ${currentUser.name || "User"}!`
      );

      // =================================================
      // REDIRECT BASED ON BACKEND / MYSQL ROLE
      // =================================================

      if (role === "ADMIN") {
        navigate("/admin", {
          replace: true
        });

        return;
      }

      if (role === "WORKER") {
        navigate("/worker", {
          replace: true
        });

        return;
      }

      navigate("/", {
        replace: true
      });

      return;

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      // =================================================
      // GET BACKEND ERROR
      // =================================================

      let message = "Invalid email or password.";

      if (error.response?.data) {
        if (
          typeof error.response.data ===
          "string"
        ) {
          message = error.response.data;

        } else if (
          error.response.data.message
        ) {
          message = error.response.data.message;
        }
      }

      // =================================================
      // 30 SECOND LOCK
      // =================================================

      if (error.response?.status === 429) {
        setLoginLocked(true);
        setLockSeconds(30);

        setErrorMessage(
          "Too many incorrect password attempts. Please wait 30 seconds."
        );

        showNotification(
          "warning",
          "Login Temporarily Locked",
          "Too many incorrect password attempts. Please wait 30 seconds."
        );

        return;
      }

      // =================================================
      // NORMAL WRONG PASSWORD
      // =================================================

      setErrorMessage(message);

      showNotification(
        "error",
        "Login Failed",
        message
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GOOGLE / FACEBOOK LOGIN
  // =====================================================

  const handleSocialLogin = (provider) => {
    setErrorMessage("");
    setSocialLoading(provider);

    /*
     * Spring Security OAuth2 endpoints:
     *
     * Google:
     * /oauth2/authorization/google
     *
     * Facebook:
     * /oauth2/authorization/facebook
     */

    const backendUrl ="https://hivecare-b.onrender.com"
      

    const oauthUrl =
      `${backendUrl}/oauth2/authorization/${provider}`;

    // Redirect browser to Spring Boot
    window.location.href = oauthUrl;
  };

  // =====================================================
  // NOTIFICATION ICON
  // =====================================================

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "success":
        return "bi bi-check-circle-fill";

      case "error":
        return "bi bi-x-circle-fill";

      case "warning":
        return "bi bi-exclamation-triangle-fill";

      default:
        return "bi bi-info-circle-fill";
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="hive-login-page">

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification.show && (
        <div
          className={`hive-login-notification ${notification.type}`}
        >
          <div className="hive-notification-icon">
            <i
              className={getNotificationIcon()}
            ></i>
          </div>

          <div className="hive-notification-content">
            <strong>
              {notification.title}
            </strong>

            <span>
              {notification.message}
            </span>
          </div>

          <button
            type="button"
            className="hive-notification-close"
            onClick={closeNotification}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* =================================================
          LOGIN WRAPPER
      ================================================= */}

      <div className="hive-login-wrapper">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="hive-login-intro">

          <div className="hive-login-logo">
            H
          </div>

          <h1>
            Welcome to <span>HiveCare</span>
          </h1>

          <p>
            Your trusted platform for professional
            home services at your doorstep.
          </p>

          {/* FEATURES */}

          <div className="hive-login-features">

            <div className="hive-login-feature">

              <div className="hive-feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Verified Professionals
                </strong>

                <small>
                  Trusted experts for your home.
                </small>
              </div>

            </div>

            <div className="hive-login-feature">

              <div className="hive-feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Easy Booking
                </strong>

                <small>
                  Book your service in minutes.
                </small>
              </div>

            </div>

            <div className="hive-login-feature">

              <div className="hive-feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Reliable Support
                </strong>

                <small>
                  We're here whenever you need us.
                </small>
              </div>

            </div>

          </div>
        </div>

        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <div className="hive-login-card">

          {/* HEADING */}

          <div className="hive-login-heading">

            <span className="hive-login-badge">
              ACCOUNT LOGIN
            </span>

            <h2>
              Welcome Back 👋
            </h2>

            <p>
              Sign in to manage your bookings
              and services.
            </p>

          </div>

          {/* ERROR */}

          {errorMessage && (
            <div
              className={`hive-login-error ${
                loginLocked
                  ? "login-lock-error"
                  : ""
              }`}
            >

              <span className="login-error-icon">
                <i
                  className={
                    loginLocked
                      ? "bi bi-shield-lock-fill"
                      : "bi bi-exclamation-triangle-fill"
                  }
                ></i>
              </span>

              <span>
                {errorMessage}

                {loginLocked && (
                  <strong>
                    {" "}Try again in {lockSeconds} seconds.
                  </strong>
                )}
              </span>

            </div>
          )}

          {/* =================================================
              EMAIL / PASSWORD
          ================================================= */}

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

            <div className="hive-login-field">

              <label htmlFor="login-email">
                Email Address
              </label>

              <div className="hive-input-wrapper">

                <span className="hive-input-icon">
                  ✉
                </span>

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="hive-login-field">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="hive-input-wrapper">

                <span className="hive-input-icon">
                  🔒
                </span>

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="hive-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁"}
                </button>

              </div>

            </div>

            {/* FORGOT PASSWORD */}

            <div className="hive-forgot-password">

              <button
                type="button"
                onClick={() =>
                  setShowForgotPassword(true)
                }
              >
                Forgot Password?
              </button>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="hive-login-button"
              disabled={
                loading ||
                socialLoading !== "" ||
                loginLocked
              }
            >

              {loginLocked ? (
                <>
                  <i className="bi bi-lock-fill"></i>
                  Try again in {lockSeconds}s
                </>
              ) : loading ? (
                <>
                  <span className="hive-spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In

                  <span className="hive-login-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>

          {/* =================================================
              SOCIAL LOGIN DIVIDER
          ================================================= */}

          <div className="hive-login-divider">
            <span>
              OR CONTINUE WITH
            </span>
          </div>

          {/* =================================================
              SOCIAL LOGIN BUTTONS
          ================================================= */}

          <div className="hive-social-login">

            {/* =================================================
                GOOGLE
            ================================================= */}

            <button
              type="button"
              className="hive-social-button hive-google-button"
              onClick={() =>
                handleSocialLogin("google")
              }
              disabled={
                loading ||
                socialLoading !== ""
              }
            >

              {socialLoading === "google" ? (
                <span className="hive-social-spinner"></span>
              ) : (
                <span className="hive-real-google-icon">

                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    aria-hidden="true"
                  >

                    <path
                      fill="#4285F4"
                      d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.93-4.18 2.93-7.4z"
                    />

                    <path
                      fill="#34A853"
                      d="M12 21.5c2.63 0 4.84-.87 6.45-2.37l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.5z"
                    />

                    <path
                      fill="#FBBC05"
                      d="M6.54 13.58A5.85 5.85 0 0 1 6.23 12c0-.55.11-1.08.31-1.58V7.9H3.3A9.73 9.73 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.1l3.24-2.52z"
                    />

                    <path
                      fill="#EA4335"
                      d="M12 6.39c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.49 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.4l3.24 2.52C7.31 8.11 9.46 6.39 12 6.39z"
                    />

                  </svg>

                </span>
              )}

              <span>
                Continue with Google
              </span>

            </button>

            {/* =================================================
                FACEBOOK
            ================================================= */}

            <button
              type="button"
              className="hive-social-button hive-facebook-button"
              onClick={() =>
                handleSocialLogin("facebook")
              }
              disabled={
                loading ||
                socialLoading !== ""
              }
            >

              {socialLoading === "facebook" ? (
                <span className="hive-social-spinner"></span>
              ) : (
                <span className="hive-real-facebook-icon">

                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    aria-hidden="true"
                  >

                    <path
                      fill="currentColor"
                      d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.1H8v3h2.6v8h2.9z"
                    />

                  </svg>

                </span>
              )}

              <span>
                Continue with Facebook
              </span>

            </button>

          </div>

          {/* =================================================
              FORGOT PASSWORD MODAL
          ================================================= */}

          {showForgotPassword && (
            <div className="hive-forgot-overlay">

              <div className="hive-forgot-modal">

                <button
                  type="button"
                  className="hive-forgot-close"
                  onClick={() =>
                    setShowForgotPassword(false)
                  }
                >
                  ×
                </button>

                <div className="hive-forgot-icon">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>

                <h2>
                  Forgot Password?
                </h2>

                <p>
                  Enter your registered email address
                  and we'll send you a secure password
                  reset link.
                </p>

                <form
                  onSubmit={handleForgotPassword}
                >

                  <div className="hive-login-field">

                    <label>
                      Email Address
                    </label>

                    <div className="hive-input-wrapper">

                      <span className="hive-input-icon">
                        ✉
                      </span>

                      <input
                        type="email"
                        placeholder="Enter your registered email"
                        value={forgotEmail}
                        onChange={(e) =>
                          setForgotEmail(e.target.value)
                        }
                        autoComplete="email"
                        required
                      />

                    </div>

                  </div>

                  <button
                    type="submit"
                    className="hive-forgot-submit"
                    disabled={forgotLoading}
                  >

                    {forgotLoading ? (
                      <>
                        <span className="hive-spinner"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-envelope-paper-fill"></i>
                        Send Reset Link
                      </>
                    )}

                  </button>

                </form>

                <button
                  type="button"
                  className="hive-forgot-back"
                  onClick={() =>
                    setShowForgotPassword(false)
                  }
                >

                  <i className="bi bi-arrow-left"></i>

                  Back to Login

                </button>

              </div>

            </div>
          )}

          {/* =================================================
              REGISTER
          ================================================= */}

          <div className="hive-login-register">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create Account
            </Link>

          </div>

          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="hive-login-security">
            🔐 Your information is securely protected
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;