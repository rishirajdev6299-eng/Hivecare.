
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import {
  getUserById,
  updateUser
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(null);

  // =====================================================
  // PROFILE
  // =====================================================

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: ""
  });

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const showNotification = (
    type,
    title,
    message
  ) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
  };

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
  // AUTO HIDE NOTIFICATION
  // =====================================================

  useEffect(() => {
    if (!notification.show) {
      return;
    }

    const timer = setTimeout(() => {
      closeNotification();
    }, 3500);

    return () => clearTimeout(timer);
  }, [notification.show]);

  // =====================================================
  // LOAD AUTHENTICATED USER
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        // =================================================
        // GET CURRENT USER FROM BACKEND
        // JWT IS USED BY AUTH CONTEXT
        // =================================================

        const currentUser = await refreshUser();

        if (!mounted) {
          return;
        }

        if (!currentUser || !currentUser.id) {
          showNotification(
            "error",
            "Session Expired",
            "Please login again to access your profile."
          );

          setTimeout(() => {
            if (mounted) {
              navigate("/login", {
                replace: true
              });
            }
          }, 1800);

          return;
        }

        setUser(currentUser);

        // =================================================
        // GET COMPLETE PROFILE FROM BACKEND
        // =================================================

        const response = await getUserById(
          currentUser.id
        );

        if (!mounted) {
          return;
        }

        const data = response.data || {};

        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          password: ""
        });

      } catch (error) {
        if (!mounted) {
          return;
        }

        showNotification(
          "error",
          "Unable to Load Profile",
          "We could not load your profile information."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [refreshUser, navigate]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      showNotification(
        "error",
        "Session Expired",
        "Please login again before updating your profile."
      );

      return;
    }

    if (saving) {
      return;
    }

    setSaving(true);

    try {
      // =================================================
      // UPDATE THROUGH BACKEND
      // =================================================

      await updateUser(
        user.id,
        profile
      );

      // =================================================
      // REFRESH AUTHENTICATED USER
      // =================================================

      await refreshUser();

      // =================================================
      // SUCCESS NOTIFICATION
      // =================================================

      showNotification(
        "success",
        "Profile Updated",
        "Your profile has been updated successfully."
      );

      // =================================================
      // WAIT 1800 MS
      // =================================================

      setTimeout(() => {
        navigate("/", {
          replace: true
        });
      }, 1800);

    } catch (error) {
      let message =
        "Unable to update your profile.";

      if (error.response?.data) {
        if (
          typeof error.response.data === "string"
        ) {
          message = error.response.data;
        } else if (
          error.response.data.message
        ) {
          message =
            error.response.data.message;
        }
      }

      showNotification(
        "error",
        "Update Failed",
        message
      );

      setSaving(false);
    }
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
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{
          minHeight: "90vh"
        }}
      >
        <div className="text-center">

          <div
            className="spinner-border text-primary"
            role="status"
            style={{
              width: "3rem",
              height: "3rem"
            }}
          ></div>

          <p className="mt-3 text-muted">
            Loading your profile...
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{
        minHeight: "90vh"
      }}
    >

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification.show && (
        <div
          className={`hive-profile-notification ${notification.type}`}
          style={{
            position: "fixed",
            top: "25px",
            right: "25px",
            zIndex: 9999,
            minWidth: "320px",
            maxWidth: "420px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "16px 18px",
            borderRadius: "14px",
            background: "#ffffff",
            boxShadow:
              "0 12px 35px rgba(0, 0, 0, 0.18)",
            borderLeft:
              notification.type === "success"
                ? "5px solid #198754"
                : notification.type === "error"
                ? "5px solid #dc3545"
                : "5px solid #ffc107",
            animation:
              "profileNotificationSlide 0.35s ease-out"
          }}
        >

          {/* ICON */}

          <div
            style={{
              fontSize: "28px",
              flexShrink: 0
            }}
          >
            <i
              className={getNotificationIcon()}
            ></i>
          </div>

          {/* CONTENT */}

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "3px"
            }}
          >

            <strong
              style={{
                fontSize: "15px"
              }}
            >
              {notification.title}
            </strong>

            <span
              style={{
                fontSize: "13px",
                color: "#666",
                lineHeight: "1.4"
              }}
            >
              {notification.message}
            </span>

          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={closeNotification}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "22px",
              cursor: "pointer",
              color: "#777",
              lineHeight: 1,
              padding: "2px 5px"
            }}
            aria-label="Close notification"
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          PROFILE CARD
      ================================================= */}

      <div
        className="card shadow-lg border-0"
        style={{
          maxWidth: "700px",
          width: "100%",
          borderRadius: "20px"
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="card-header text-center bg-primary text-white"
          style={{
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px"
          }}
        >

          <i
            className="bi bi-person-circle"
            style={{
              fontSize: "70px"
            }}
          ></i>

          <h3 className="mt-2 mb-0">
            My Profile
          </h3>

          <small>
            Manage your personal information
          </small>

        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="card-body p-4">

          <form onSubmit={handleSubmit}>

            <div className="row">

              {/* FULL NAME */}

              <div className="col-md-6 mb-3">

                <label
                  htmlFor="profile-name"
                  className="form-label"
                >
                  Full Name
                </label>

                <input
                  id="profile-name"
                  type="text"
                  className="form-control"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={saving}
                  required
                />

              </div>

              {/* EMAIL */}

              <div className="col-md-6 mb-3">

                <label
                  htmlFor="profile-email"
                  className="form-label"
                >
                  Email
                </label>

                <input
                  id="profile-email"
                  type="email"
                  className="form-control"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={saving}
                  required
                />

              </div>

              {/* PHONE */}

              <div className="col-md-6 mb-3">

                <label
                  htmlFor="profile-phone"
                  className="form-label"
                >
                  Phone Number
                </label>

                <input
                  id="profile-phone"
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={saving}
                />

              </div>

              {/* ADDRESS */}

              <div className="col-md-6 mb-3">

                <label
                  htmlFor="profile-address"
                  className="form-label"
                >
                  Address
                </label>

                <input
                  id="profile-address"
                  type="text"
                  className="form-control"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  disabled={saving}
                />

              </div>

              {/* PASSWORD */}

              <div className="col-12 mb-4">

                <label
                  htmlFor="profile-password"
                  className="form-label"
                >
                  New Password
                </label>

                <input
                  id="profile-password"
                  type="password"
                  className="form-control"
                  name="password"
                  value={profile.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  disabled={saving}
                />

                <small className="text-muted">
                  Leave blank if you do not want to
                  change your password.
                </small>

              </div>

            </div>

            {/* =================================================
                UPDATE BUTTON
            ================================================= */}

            <div className="d-grid">

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{
                  borderRadius: "12px"
                }}
                disabled={saving}
              >

                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>

                    Updating Profile...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>

                    Update Profile
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </div>

      {/* =================================================
          NOTIFICATION ANIMATION
      ================================================= */}

      <style>
        {`
          @keyframes profileNotificationSlide {
            from {
              opacity: 0;
              transform: translateX(40px);
            }

            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .hive-profile-notification.success {
            color: #198754;
          }

          .hive-profile-notification.error {
            color: #dc3545;
          }

          .hive-profile-notification.warning {
            color: #b58105;
          }
        `}
      </style>

    </div>
  );
}

export default Profile;

