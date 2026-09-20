import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo 3.png";
import "./Navbar.css";

import {
  sendChatMessage as sendChatMessageAPI,
  getUserById,
  updateProfileImage
} from "../../api/api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // =========================================================
  // STATES
  // =========================================================

  const [scrolled, setScrolled] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] =
    useState(false);

  // Desktop profile
  const [showProfile, setShowProfile] = useState(false);

  // Mobile profile
  const [mobileProfileOpen, setMobileProfileOpen] =
    useState(false);

  const [profileImage, setProfileImage] = useState("");

  const [showProfileImagePreview, setShowProfileImagePreview] =
    useState(false);

  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });

  const [loggingOut, setLoggingOut] = useState(false);

  // =========================================================
  // REFS
  // =========================================================

  const profileWrapperRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const chatBodyRef = useRef(null);

  const notificationTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  // =========================================================
  // USER ROLE
  // =========================================================

  const role = String(user?.role || "USER").toUpperCase();

  // =========================================================
  // USER NAME
  // =========================================================

  const userName = String(user?.name || "User").trim();

  const userInitial =
    userName.length > 0
      ? userName.charAt(0).toUpperCase()
      : "U";

  // =========================================================
  // SEARCH SUGGESTIONS
  // =========================================================

  const searchSuggestions = [
    "Plumber",
    "Electrician",
    "Carpenter",
    "Maid",
    "Babysitter",
    "Pet Sitter",
    "Gym Trainer",
    "Beautician",
    "Yoga Instructor",
    "Tutor",
    "House Cleaning",
    "Appliance Repair"
  ];

  // =========================================================
  // SCROLL
  // =========================================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =========================================================
  // KEYBOARD / OUTSIDE NAVIGATION CLEANUP
  // =========================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setShowProfile(false);
        setMobileProfileOpen(false);
        setShowSearchSuggestions(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // =========================================================
  // LOAD PROFILE IMAGE
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadProfileImage = async () => {
      if (!user?.id) {
        if (mounted) {
          setProfileImage("");
        }

        return;
      }

      const imageCacheKey =
        `hivecare_profile_image_${String(user.id)}`;

      // -------------------------------------------------------
      // LOAD CACHED IMAGE FIRST
      // -------------------------------------------------------

      try {
        const cachedImage =
          localStorage.getItem(imageCacheKey);

        if (mounted && cachedImage) {
          setProfileImage(cachedImage);
        }
      } catch {
        // Ignore localStorage errors.
      }

      // -------------------------------------------------------
      // LOAD IMAGE FROM BACKEND
      // -------------------------------------------------------

      try {
        const response = await getUserById(user.id);

        if (!mounted) {
          return;
        }

        const image =
          response?.profileImage ||
          response?.profile_image ||
          response?.data?.profileImage ||
          response?.data?.profile_image ||
          "";

        if (image) {
          setProfileImage(image);

          try {
            localStorage.setItem(
              imageCacheKey,
              image
            );
          } catch {
            // Ignore cache errors.
          }
        }
      } catch {
        // Keep cached image if backend request fails.
      }
    };

    loadProfileImage();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // =========================================================
  // CLOSE DESKTOP PROFILE ON OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!showProfile) {
        return;
      }

      const profileWrapper =
        profileWrapperRef.current;

      const profileDropdown =
        profileDropdownRef.current;

      const clickedInsideWrapper =
        profileWrapper &&
        profileWrapper.contains(event.target);

      const clickedInsideDropdown =
        profileDropdown &&
        profileDropdown.contains(event.target);

      if (
        !clickedInsideWrapper &&
        !clickedInsideDropdown
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );
    };
  }, [showProfile]);

  // =========================================================
  // USER CHANGE CLEANUP
  // =========================================================

  useEffect(() => {
    if (!user) {
      setShowProfile(false);
      setMobileProfileOpen(false);
      setShowChat(false);
      setMenuOpen(false);
      setShowProfileImagePreview(false);
      setProfileImage("");
      setChatMessage("");
      setChatMessages([]);
      setSearchTerm("");
      setShowSearchSuggestions(false);
    }
  }, [user]);

  // =========================================================
  // CLEANUP TIMERS
  // =========================================================

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }

      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  // =========================================================
  // CHAT AUTO SCROLL
  // =========================================================

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [chatMessages, chatLoading]);

  // =========================================================
  // NOTIFICATION
  // =========================================================

  const showNotification = (
    type,
    message,
    duration = 1800
  ) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }

    setNotification({
      show: true,
      type,
      message
    });

    notificationTimerRef.current = setTimeout(() => {
      setNotification({
        show: false,
        type: "",
        message: ""
      });

      notificationTimerRef.current = null;
    }, duration);
  };

  // =========================================================
  // DESKTOP PROFILE TOGGLE
  // =========================================================

  const toggleProfile = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!user || loggingOut) {
      return;
    }

    setShowChat(false);
    setShowSearchSuggestions(false);

    setShowProfile((previous) => !previous);
  };

  // =========================================================
  // CLOSE MENU
  // =========================================================

  const closeMenu = () => {
    setMenuOpen(false);
    setShowProfile(false);
    setMobileProfileOpen(false);
    setShowSearchSuggestions(false);
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (event) => {
    event.preventDefault();

    const value = searchTerm.trim();

    if (!value) {
      return;
    }

    navigate(
      `/services?search=${encodeURIComponent(value)}`
    );

    setSearchTerm("");
    setShowSearchSuggestions(false);
    setMenuOpen(false);
    setMobileProfileOpen(false);
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(
      `/services?search=${encodeURIComponent(suggestion)}`
    );

    setSearchTerm("");
    setShowSearchSuggestions(false);
    setMenuOpen(false);
    setMobileProfileOpen(false);
  };

  const filteredSuggestions =
    searchSuggestions.filter((item) =>
      item
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  // =========================================================
  // CHAT OPEN
  // =========================================================

  const openChat = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setShowChat(true);
    setShowProfile(false);
    setMenuOpen(false);
    setMobileProfileOpen(false);
    setShowSearchSuggestions(false);

    if (chatMessages.length === 0) {
      setChatMessages([
        {
          sender: "bot",
          message:
            "Welcome to HiveCare Support! 👋 I'm your AI support assistant. How can I help you today?"
        }
      ]);
    }
  };

  // =========================================================
  // CHAT CLOSE
  // =========================================================

  const closeChat = () => {
    if (chatLoading) {
      return;
    }

    setShowChat(false);
  };

  // =========================================================
  // CHAT SEND
  // =========================================================

  const handleSendChatMessage = async (event) => {
    event.preventDefault();

    const message = chatMessage.trim();

    if (!message || chatLoading || !user) {
      return;
    }

    const currentUser = user;

    setChatMessages((previous) => [
      ...previous,
      {
        sender: "user",
        message
      }
    ]);

    setChatMessage("");
    setChatLoading(true);

    try {
      const payload = {
        message: message,

        userId: currentUser?.id || null,
        currentUserId: currentUser?.id || null,

        userName: currentUser?.name || "",
        email: currentUser?.email || "",

        role: currentUser?.role || "USER",

        workerService:
          currentUser?.workerService || ""
      };

      const response =
        await sendChatMessageAPI(payload);

      let reply = "";

      if (typeof response === "string") {
        reply = response;
      } else {
        reply =
          response?.reply ||
          response?.message ||
          response?.response ||
          response?.data?.reply ||
          response?.data?.message ||
          response?.data?.response ||
          "";
      }

      if (!reply || !String(reply).trim()) {
        reply =
          "I received your message, but I couldn't generate a response right now. Please try again.";
      }

      setChatMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          message: String(reply)
        }
      ]);
    } catch {
      setChatMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          message:
            "I'm having trouble connecting to HiveCare AI right now. Please check that the HiveCare backend is running and try again."
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // =========================================================
  // QUICK QUESTION
  // =========================================================

  const sendQuickQuestion = (question) => {
    if (chatLoading) {
      return;
    }

    setChatMessage(question);
  };

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !user?.id) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showNotification(
        "error",
        "Please select a valid image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification(
        "error",
        "Image size must be less than 5 MB."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const imageData = reader.result;

        await updateProfileImage(
          user.id,
          imageData
        );

        try {
          localStorage.setItem(
            `hivecare_profile_image_${String(user.id)}`,
            imageData
          );
        } catch {
          // Ignore cache failure.
        }

        setProfileImage(imageData);

        showNotification(
          "success",
          "Profile image updated successfully!"
        );
      } catch {
        showNotification(
          "error",
          "Unable to update profile image."
        );
      }
    };

    reader.onerror = () => {
      showNotification(
        "error",
        "Unable to read the selected image."
      );
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    setShowProfile(false);
    setMobileProfileOpen(false);
    setMenuOpen(false);
    setShowChat(false);
    setShowSearchSuggestions(false);
    setShowProfileImagePreview(false);

    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }

    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    logout();

    setNotification({
      show: true,
      type: "success",
      message: "Logged out successfully!"
    });

    logoutTimerRef.current = setTimeout(() => {
      setNotification({
        show: false,
        type: "",
        message: ""
      });

      logoutTimerRef.current = null;

      navigate("/login", {
        replace: true,
        state: null
      });
    }, 1800);
  };

  // =========================================================
  // AVATAR CLICK
  // =========================================================

  const handleAvatarClick = (event) => {
    if (!profileImage || loggingOut) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setShowProfileImagePreview(true);
  };

  const closeProfileImagePreview = () => {
    setShowProfileImagePreview(false);
  };

  // =========================================================
  // MOBILE MENU
  // =========================================================

  const toggleMobileMenu = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (loggingOut) {
      return;
    }

    setMenuOpen((previous) => {
      const nextState = !previous;

      if (nextState) {
        setShowProfile(false);
        setMobileProfileOpen(false);
        setShowSearchSuggestions(false);
      } else {
        setShowProfile(false);
        setMobileProfileOpen(false);
        setShowSearchSuggestions(false);
      }

      return nextState;
    });
  };

  // =========================================================
  // MOBILE PROFILE TOGGLE
  // =========================================================

  const toggleMobileProfile = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!user || loggingOut) {
      return;
    }

    setShowProfile(false);
    setShowSearchSuggestions(false);

    setMobileProfileOpen((previous) => !previous);
  };

  // =========================================================
  // CLOSE MOBILE PROFILE
  // =========================================================

  const closeMobileProfile = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    setMobileProfileOpen(false);
  };

  // =========================================================
  // RENDER PROFILE CONTENT
  // =========================================================

  const renderProfileContent = () => {
    return (
      <>
        <div className="hc-profile-top">

          <div className="hc-profile-avatar-container">

            <div className="hc-profile-avatar-large">

              {profileImage ? (
                <img
                  src={profileImage}
                  alt={userName}
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowProfileImagePreview(true);
                  }}
                />
              ) : (
                <span
                  className="hc-profile-initial"
                  aria-label={`${userName} profile`}
                >
                  {userInitial}
                </span>
              )}

            </div>

            <label className="hc-profile-image-upload">

              <i className="bi bi-camera-fill"></i>

              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                hidden
              />

            </label>

          </div>

          <div className="hc-profile-name-section">

            <h4>
              {userName}
            </h4>

            <span className="hc-role-badge">
              <i className="bi bi-shield-check"></i>
              {role}
            </span>

          </div>

        </div>

        <div className="hc-profile-divider"></div>

        <div className="hc-profile-details">

          {user?.email && (
            <div className="hc-profile-detail">

              <i className="bi bi-envelope hc-detail-icon email"></i>

              <div>
                <small>Email</small>
                <p>{user.email}</p>
              </div>

            </div>
          )}

          {user?.phone && (
            <div className="hc-profile-detail">

              <i className="bi bi-telephone hc-detail-icon phone"></i>

              <div>
                <small>Phone</small>
                <p>{user.phone}</p>
              </div>

            </div>
          )}

          {user?.address && (
            <div className="hc-profile-detail">

              <i className="bi bi-geo-alt hc-detail-icon address"></i>

              <div>
                <small>Address</small>
                <p>{user.address}</p>
              </div>

            </div>
          )}

          {role === "WORKER" &&
            user?.workerService && (
              <div className="hc-profile-detail">

                <i className="bi bi-tools hc-detail-icon service"></i>

                <div>
                  <small>Service</small>
                  <p>
                    {user.workerService}
                  </p>
                </div>

              </div>
            )}

        </div>

        <div className="hc-profile-divider"></div>

        <div className="hc-profile-actions">

          <Link
            to="/profile"
            className="hc-profile-action"
            onClick={(event) => {
              event.stopPropagation();

              setShowProfile(false);
              setMobileProfileOpen(false);
              setMenuOpen(false);
            }}
          >

            <div className="hc-action-icon">
              <i className="bi bi-pencil-square"></i>
            </div>

            <span>Edit Profile</span>

            <i className="bi bi-chevron-right"></i>

          </Link>

          <button
            type="button"
            className="hc-profile-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >

            <div className="hc-action-icon">
              <i className="bi bi-box-arrow-right"></i>
            </div>

            <span>
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </span>

          </button>

        </div>
      </>
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav
        className={`hc-navbar ${
          scrolled ? "hc-navbar-scrolled" : ""
        }`}
      >
        <div className="hc-navbar-container">

          {/* =================================================
              LOGO
          ================================================== */}

          <div className="hc-brand">

            <Link
              to="/"
              className="hc-brand-link"
              onClick={closeMenu}
            >

              <div className="hc-logo-wrapper">

                <img
                  src={logo}
                  alt="HiveCare"
                  className="hc-logo"
                />

              </div>

              <div className="hc-brand-name">

                <span className="hc-hive">
                  Hive
                </span>

                <span className="hc-care">
                  Care
                </span>

              </div>

            </Link>

          </div>

          {/* =================================================
              DESKTOP SEARCH
          ================================================== */}

          {role !== "ADMIN" &&
            role !== "WORKER" && (

              <div className="hc-search-container hc-desktop-search">

                <form
                  className="hc-search"
                  onSubmit={handleSearch}
                >

                  <i className="bi bi-search"></i>

                  <input
                    type="text"
                    value={searchTerm}
                    placeholder="Search services..."
                    onChange={(event) => {

                      const value =
                        event.target.value;

                      setSearchTerm(value);

                      setShowSearchSuggestions(
                        value.trim().length > 0
                      );

                    }}
                    onFocus={() => {

                      if (searchTerm.trim()) {
                        setShowSearchSuggestions(true);
                      }

                    }}
                  />

                  {searchTerm && (

                    <button
                      type="button"
                      className="hc-search-clear"
                      onClick={() => {
                        setSearchTerm("");
                        setShowSearchSuggestions(false);
                      }}
                      aria-label="Clear search"
                    >

                      <i className="bi bi-x"></i>

                    </button>

                  )}

                </form>

                {showSearchSuggestions &&
                  searchTerm.trim() &&
                  filteredSuggestions.length > 0 && (

                    <div className="hc-search-suggestions">

                      {filteredSuggestions.map(
                        (suggestion) => (

                          <button
                            type="button"
                            className="hc-search-suggestion"
                            key={suggestion}
                            onClick={() =>
                              handleSuggestionClick(
                                suggestion
                              )
                            }
                          >

                            <div className="hc-suggestion-icon">

                              <i className="bi bi-search"></i>

                            </div>

                            <span>
                              {suggestion}
                            </span>

                            <i className="bi bi-arrow-up-right"></i>

                          </button>

                        )
                      )}

                    </div>

                  )}

                {showSearchSuggestions &&
                  searchTerm.trim() &&
                  filteredSuggestions.length === 0 && (

                    <div className="hc-search-no-result">

                      <i className="bi bi-search"></i>

                      <span>
                        No services found
                      </span>

                    </div>

                  )}

              </div>

            )}

          {/* =================================================
              MAIN NAVIGATION
          ================================================== */}

          <div
            id="hc-mobile-navigation"
            className={`hc-nav-links ${
              menuOpen
                ? "hc-nav-active"
                : ""
            } ${
              mobileProfileOpen
                ? "hc-mobile-profile-mode"
                : ""
            }`}
          >

            {/* =================================================
                MOBILE SEARCH
            ================================================== */}

            {!mobileProfileOpen &&
              role !== "ADMIN" &&
              role !== "WORKER" && (

                <div className="hc-mobile-search">

                  <form
                    className="hc-search"
                    onSubmit={handleSearch}
                  >

                    <i className="bi bi-search"></i>

                    <input
                      type="text"
                      value={searchTerm}
                      placeholder="Search services..."
                      onChange={(event) => {

                        const value =
                          event.target.value;

                        setSearchTerm(value);

                        setShowSearchSuggestions(
                          value.trim().length > 0
                        );

                      }}
                      onFocus={() => {

                        if (searchTerm.trim()) {
                          setShowSearchSuggestions(true);
                        }

                      }}
                    />

                    {searchTerm && (

                      <button
                        type="button"
                        className="hc-search-clear"
                        onClick={() => {
                          setSearchTerm("");
                          setShowSearchSuggestions(false);
                        }}
                        aria-label="Clear search"
                      >

                        <i className="bi bi-x"></i>

                      </button>

                    )}

                  </form>

                  {showSearchSuggestions &&
                    searchTerm.trim() &&
                    filteredSuggestions.length > 0 && (

                      <div className="hc-search-suggestions">

                        {filteredSuggestions.map(
                          (suggestion) => (

                            <button
                              type="button"
                              className="hc-search-suggestion"
                              key={suggestion}
                              onClick={() =>
                                handleSuggestionClick(
                                  suggestion
                                )
                              }
                            >

                              <div className="hc-suggestion-icon">

                                <i className="bi bi-search"></i>

                              </div>

                              <span>
                                {suggestion}
                              </span>

                              <i className="bi bi-arrow-up-right"></i>

                            </button>

                          )
                        )}

                      </div>

                    )}

                  {showSearchSuggestions &&
                    searchTerm.trim() &&
                    filteredSuggestions.length === 0 && (

                      <div className="hc-search-no-result">

                        <i className="bi bi-search"></i>

                        <span>
                          No services found
                        </span>

                      </div>

                    )}

                </div>

              )}

            {/* =================================================
                NORMAL NAVIGATION
            ================================================== */}

            {!mobileProfileOpen && (
              <>
                {user && role === "ADMIN" ? (

                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="hc-nav-link hc-special-link"
                  >

                    <i className="bi bi-speedometer2"></i>

                    <span>
                      Admin Dashboard
                    </span>

                  </Link>

                ) : user && role === "WORKER" ? (

                  <Link
                    to="/worker"
                    onClick={closeMenu}
                    className="hc-nav-link hc-special-link"
                  >

                    <i className="bi bi-person-workspace"></i>

                    <span>
                      Worker Dashboard
                    </span>

                  </Link>

                ) : (

                  <>
                    <Link
                      to="/"
                      onClick={closeMenu}
                      className="hc-nav-link"
                    >

                      <i className="bi bi-house-door-fill"></i>

                      <span>
                        Home
                      </span>

                    </Link>

                    <Link
                      to="/services"
                      onClick={closeMenu}
                      className="hc-nav-link"
                    >

                      <i className="bi bi-grid-fill"></i>

                      <span>
                        Services
                      </span>

                    </Link>

                    {user && (

                      <Link
                        to="/history"
                        onClick={closeMenu}
                        className="hc-nav-link"
                      >

                        <i className="bi bi-clock-history"></i>

                        <span>
                          Bookings
                        </span>

                      </Link>

                    )}

                    {user && (

                      <button
                        type="button"
                        className="hc-nav-link hc-support-nav-btn"
                        onClick={openChat}
                      >

                        <i className="bi bi-headset"></i>

                        <span>
                          Support
                        </span>

                      </button>

                    )}

                  </>

                )}
              </>
            )}

            {/* =================================================
                MOBILE ACCOUNT AREA
            ================================================== */}

            <div className="hc-mobile-account">

              {user ? (

                <>
                  {!mobileProfileOpen ? (

                    /* =========================================
                       MOBILE PROFILE HEADER
                    ========================================== */

                    <button
                      type="button"
                      className="hc-mobile-profile-trigger"
                      onClick={toggleMobileProfile}
                      disabled={loggingOut}
                      aria-expanded={false}
                    >

                      <div className="hc-mobile-profile-avatar">

                        {profileImage ? (

                          <img
                            src={profileImage}
                            alt={userName}
                          />

                        ) : (

                          <span>
                            {userInitial}
                          </span>

                        )}

                      </div>

                      <div className="hc-mobile-profile-info">

                        <strong>
                          {userName}
                        </strong>

                        <span>
                          {role}
                        </span>

                      </div>

                      <i className="bi bi-chevron-right"></i>

                    </button>

                  ) : (

                    /* =========================================
                       MOBILE PROFILE PANEL
                    ========================================== */

                    <div
                      className="hc-mobile-profile-panel"
                      ref={profileDropdownRef}
                    >

                      {/* BACK BUTTON */}

                      <button
                        type="button"
                        className="hc-mobile-profile-back"
                        onClick={closeMobileProfile}
                      >

                        <i className="bi bi-arrow-left"></i>

                        <span>
                          Back to Menu
                        </span>

                      </button>

                      {/* PROFILE CONTENT */}

                      {renderProfileContent()}

                    </div>

                  )}

                </>

              ) : (

                <div className="hc-mobile-auth">

                  <Link
                    to="/login"
                    className="hc-mobile-auth-btn hc-mobile-login"
                    onClick={closeMenu}
                  >

                    <i className="bi bi-box-arrow-in-right"></i>

                    <span>
                      Login
                    </span>

                  </Link>

                  <Link
                    to="/register"
                    className="hc-mobile-auth-btn hc-mobile-register"
                    onClick={closeMenu}
                  >

                    <i className="bi bi-person-plus-fill"></i>

                    <span>
                      Register
                    </span>

                  </Link>

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              DESKTOP RIGHT SIDE
          ================================================== */}

          <div className="hc-navbar-right">

            {/* DESKTOP ACCOUNT */}

            <div className="hc-desktop-account">

              {user ? (

                <div
                  className="hc-profile-wrapper"
                  ref={profileWrapperRef}
                >

                  <button
                    type="button"
                    className={`hc-profile-btn ${
                      showProfile
                        ? "hc-profile-active"
                        : ""
                    }`}
                    onClick={toggleProfile}
                    disabled={loggingOut}
                    aria-expanded={showProfile}
                    aria-haspopup="true"
                  >

                    <div
                      className={`hc-user-avatar ${
                        profileImage
                          ? "hc-clickable-avatar"
                          : ""
                      }`}
                      onClick={handleAvatarClick}
                    >

                      {profileImage ? (

                        <img
                          src={profileImage}
                          alt={userName}
                        />

                      ) : (

                        <span
                          className="hc-user-initial"
                          aria-label={`${userName} profile`}
                        >
                          {userInitial}
                        </span>

                      )}

                    </div>

                    <div className="hc-user-name">

                      <span>
                        {userName}
                      </span>

                    </div>

                    <i
                      className={`bi ${
                        showProfile
                          ? "bi-chevron-up"
                          : "bi-chevron-down"
                      }`}
                    ></i>

                  </button>

                </div>

              ) : (

                <div className="hc-auth-buttons">

                  <Link
                    to="/login"
                    className="hc-login-btn"
                    onClick={closeMenu}
                  >

                    <i className="bi bi-box-arrow-in-right"></i>

                    <span>
                      Login
                    </span>

                  </Link>

                  <Link
                    to="/register"
                    className="hc-register-btn"
                    onClick={closeMenu}
                  >

                    <i className="bi bi-person-plus-fill"></i>

                    <span>
                      Register
                    </span>

                  </Link>

                </div>

              )}

            </div>

            {/* =================================================
                MOBILE HAMBURGER
            ================================================== */}

            <button
              type="button"
              className={`hc-menu-toggle ${
                menuOpen
                  ? "open"
                  : ""
              }`}
              onClick={toggleMobileMenu}
              aria-label={
                menuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              aria-controls="hc-mobile-navigation"
            >

              <i
                className={`bi ${
                  menuOpen
                    ? "bi-x-lg"
                    : "bi-list"
                }`}
              ></i>

            </button>

          </div>

        </div>
      </nav>

      {/* =====================================================
          DESKTOP PROFILE DROPDOWN
      ====================================================== */}

      {user &&
        showProfile &&
        !loggingOut && (

          <div
            className="hc-profile-dropdown hc-desktop-profile-dropdown"
            ref={profileDropdownRef}
          >

            {renderProfileContent()}

          </div>

        )}

      {/* =====================================================
          AI SUPPORT CHAT
      ====================================================== */}

      {showChat && user && (

        <div
          className="hc-chat-overlay"
          onClick={(event) => {

            if (
              event.target === event.currentTarget &&
              !chatLoading
            ) {

              setShowChat(false);

            }

          }}
        >

          <div className="hc-chat-window">

            <div className="hc-chat-header">

              <div className="hc-chat-brand">

                <div className="hc-chat-avatar">

                  <i className="bi bi-robot"></i>

                  <span className="hc-online-dot"></span>

                </div>

                <div>

                  <h3>
                    HiveCare AI
                  </h3>

                  <span>
                    AI Support Assistant
                  </span>

                </div>

              </div>

              <button
                type="button"
                className="hc-chat-close"
                onClick={closeChat}
                disabled={chatLoading}
                aria-label="Close support"
              >

                <i className="bi bi-x-lg"></i>

              </button>

            </div>

            <div
              className="hc-chat-body"
              ref={chatBodyRef}
            >

              {chatMessages.map(
                (item, index) => {

                  const isUser =
                    item.sender === "user";

                  return (

                    <div
                      key={`${item.sender}-${index}`}
                      className={`hc-chat-message-row ${
                        isUser
                          ? "hc-chat-user-row"
                          : "hc-chat-bot-row"
                      }`}
                    >

                      {!isUser && (

                        <div className="hc-message-avatar">

                          <i className="bi bi-robot"></i>

                        </div>

                      )}

                      <div
                        className={`hc-chat-message ${
                          isUser
                            ? "hc-chat-user-message"
                            : "hc-chat-bot-message"
                        }`}
                      >

                        {item.message}

                      </div>

                    </div>

                  );

                }
              )}

              {chatLoading && (

                <div className="hc-chat-message-row hc-chat-bot-row">

                  <div className="hc-message-avatar">

                    <i className="bi bi-robot"></i>

                  </div>

                  <div className="hc-chat-message hc-chat-bot-message hc-typing">

                    <span></span>
                    <span></span>
                    <span></span>

                  </div>

                </div>

              )}

            </div>

            {chatMessages.length <= 1 &&
              !chatLoading && (

                <div className="hc-quick-questions">

                  <button
                    type="button"
                    onClick={() =>
                      sendQuickQuestion(
                        "How can I book a service?"
                      )
                    }
                  >

                    <i className="bi bi-calendar-check"></i>

                    Book a service

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      sendQuickQuestion(
                        "How can I check my booking?"
                      )
                    }
                  >

                    <i className="bi bi-clock-history"></i>

                    Check booking

                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      sendQuickQuestion(
                        "How can I contact support?"
                      )
                    }
                  >

                    <i className="bi bi-headset"></i>

                    Contact support

                  </button>

                </div>

              )}

            <form
              className="hc-chat-input-area"
              onSubmit={handleSendChatMessage}
            >

              <input
                type="text"
                value={chatMessage}
                placeholder="Ask HiveCare AI anything..."
                onChange={(event) =>
                  setChatMessage(
                    event.target.value
                  )
                }
                disabled={chatLoading}
                autoComplete="off"
              />

              <button
                type="submit"
                disabled={
                  chatLoading ||
                  !chatMessage.trim()
                }
                aria-label="Send message"
              >

                {chatLoading ? (

                  <i className="bi bi-hourglass-split"></i>

                ) : (

                  <i className="bi bi-send-fill"></i>

                )}

              </button>

            </form>

            <div className="hc-chat-footer">

              <i className="bi bi-stars"></i>

              Powered by HiveCare AI

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          PROFILE IMAGE PREVIEW
      ====================================================== */}

      {showProfileImagePreview &&
        profileImage && (

          <div
            className="hc-profile-image-modal"
            onClick={closeProfileImagePreview}
          >

            <div
              className="hc-profile-image-preview"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                className="hc-profile-image-close"
                onClick={closeProfileImagePreview}
                aria-label="Close image"
              >

                <i className="bi bi-x-lg"></i>

              </button>

              <img
                src={profileImage}
                alt={`${userName} profile preview`}
              />

              <label className="hc-profile-image-change">

                <i className="bi bi-camera-fill"></i>

                Change Photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  hidden
                />

              </label>

            </div>

          </div>

        )}

      {/* =====================================================
          NOTIFICATION
      ====================================================== */}

      {notification.show && (

        <div
          className={`hc-notification hc-notification-${notification.type}`}
        >

          <div className="hc-notification-icon">

            {notification.type === "success" ? (

              <i className="bi bi-check-lg"></i>

            ) : (

              <i className="bi bi-exclamation-lg"></i>

            )}

          </div>

          <div className="hc-notification-content">

            <strong>

              {notification.type === "success"
                ? "Success"
                : "Error"}

            </strong>

            <span>
              {notification.message}
            </span>

          </div>

          <button
            type="button"
            className="hc-notification-close"
            onClick={() => {

              if (
                notificationTimerRef.current
              ) {

                clearTimeout(
                  notificationTimerRef.current
                );

                notificationTimerRef.current =
                  null;

              }

              setNotification({
                show: false,
                type: "",
                message: ""
              });

            }}
            aria-label="Close notification"
          >

            <i className="bi bi-x"></i>

          </button>

        </div>

      )}

    </>
  );
};

export default Navbar;