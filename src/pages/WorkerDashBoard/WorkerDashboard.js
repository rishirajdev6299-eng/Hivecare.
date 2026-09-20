import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import BookingMap from "../../components/BookingMap/BookingMap";
import logo from "../../assets/images/logo 3.png";
import {
  getWorker,
  getWorkerRequests,
  getWorkerBookings,
  acceptBooking,
  rejectBooking,
  completeService,
  updateWorkerAvailability,
  sendChatMessage as sendChatMessageAPI,
  getWorkerReviews,
} from "../../api/api";

import "./WorkerDashboard.css";

const WorkerDashboard = () => {
  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigate = useNavigate();

  /* =========================================================
     WORKER DATA
     
     IMPORTANT:
     worker MUST be initialized before any useEffect
     references worker?.id.
  ========================================================= */

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [requests, setRequests] = useState([]);
  const [myBookings, setMyBookings] = useState([]);

  /* =========================================================
     REVIEWS
  ========================================================= */



  /* =========================================================
     LOADING
  ========================================================= */

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  /* =========================================================
     FILTERS
  ========================================================= */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* =========================================================
     NOTIFICATION
  ========================================================= */

  const [notification, setNotification] = useState(null);

  /* =========================================================
     BOOKING DETAILS
  ========================================================= */

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] =
    useState(false);

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] =
    useState("dashboard");

  /* =========================================================
     HIVECARE AI CHAT SUPPORT
     Uses the same chatbot API as Navbar
  ========================================================= */

  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      message:
        "Hi! 👋 Welcome to HiveCare Support. How can I help you today?",
    },
  ]);

  const chatBodyRef = useRef(null);

 /* =========================================================
   CURRENT AUTHENTICATED USER
========================================================= */

const {
  user,
  loading: authLoading,
  logout,
} = useAuth();
  useEffect(() => {

    if (!worker?.id) {
      return;
    }

    const loadWorkerReviews = async () => {

      try {

        const response =
          await getWorkerReviews(worker.id);

        const data =
          Array.isArray(response?.data)
            ? response.data
            : [];

        setReviews(data);

        if (data.length > 0) {

          const total =
            data.reduce(
              (sum, review) =>
                sum +
                Number(review?.rating || 0),
              0
            );

          setAverageRating(
            (total / data.length).toFixed(1)
          );

        } else {

          setAverageRating(0);
        }

      } catch (error) {

        console.error(
          "Unable to load worker reviews:",
          error
        );

        setReviews([]);
        setAverageRating(0);
      }

    };

    loadWorkerReviews();

  }, [worker?.id]);
  /* =========================================================
     AUTH
  ========================================================= */

 /* =========================================================
   AUTH
========================================================= */

useEffect(() => {
  if (authLoading) {
    return;
  }

  if (!user) {
    navigate("/login", { replace: true });
    return;
  }

  const role = String(user.role || "")
    .trim()
    .toUpperCase();

  if (role !== "WORKER") {
    navigate("/", { replace: true });
    return;
  }

  loadWorker();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [authLoading, user, navigate]);

  /* =========================================================
     LOAD WORKER REVIEWS

     FIX:
     worker state is now declared BEFORE this effect.
  ========================================================= */

  useEffect(() => {
    if (!worker?.id) return;

    let cancelled = false;

    const loadReviews = async () => {
      try {
        const response = await getWorkerReviews(worker.id);

        if (cancelled) return;

        const data = Array.isArray(response?.data)
          ? response.data
          : [];

        setReviews(data);

        if (data.length > 0) {
          const total = data.reduce(
            (sum, item) =>
              sum + Number(item?.rating || 0),
            0
          );

          setAverageRating(
            (total / data.length).toFixed(1)
          );
        } else {
          setAverageRating(0);
        }
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Unable to load worker reviews:",
          error
        );

        setReviews([]);
        setAverageRating(0);
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [worker?.id]);

  /* =========================================================
     LOAD WORKER DATA
  ========================================================= */

  const loadWorker = async (showRefresh = false) => {
    if (!user?.id) return;

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        workerRes,
        requestRes,
        bookingRes,
      ] = await Promise.all([
        getWorker(user.id),
        getWorkerRequests(user.id),
        getWorkerBookings(user.id),
      ]);

      let workerData = workerRes?.data;

      /*
       * Keep existing automatic-online behavior.
       */

      if (
        workerData &&
        !workerData.blocked &&
        !workerData.availabilitySet
      ) {
        try {
          const onlineResponse =
            await updateWorkerAvailability(
              workerData.id,
              true
            );

          if (onlineResponse?.data) {
            workerData = onlineResponse.data;
          }
        } catch (error) {
          console.error(
            "Unable to set worker online:",
            error
          );
        }
      }

      setWorker(workerData);

      setRequests(
        Array.isArray(requestRes?.data)
          ? requestRes.data
          : []
      );

      setMyBookings(
        Array.isArray(bookingRes?.data)
          ? bookingRes.data
          : []
      );
    } catch (error) {
      console.error(
        "Worker dashboard loading error:",
        error
      );

      showNotification(
        error?.response?.data?.message ||
        "Unable to load worker dashboard.",
        "error"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     NOTIFICATION
  ========================================================= */

  const showNotification = (
    message,
    type = "success"
  ) => {
    setNotification({
      message,
      type,
    });

    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  /* =========================================================
     AVAILABILITY
  ========================================================= */

  const handleAvailabilityToggle = async () => {
    if (!worker || worker.blocked) return;

    try {
      setAvailabilityLoading(true);

      const newStatus = !worker.available;

      const response =
        await updateWorkerAvailability(
          worker.id,
          newStatus
        );

      if (response?.data) {
        setWorker(response.data);
      }

      showNotification(
        newStatus
          ? "You are now online and available for service requests."
          : "You are now offline.",
        "success"
      );
    } catch (error) {
      console.error(
        "Availability update error:",
        error
      );

      showNotification(
        error?.response?.data?.message ||
        "Unable to update availability.",
        "error"
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  /* =========================================================
     ACCEPT BOOKING
  ========================================================= */

  const handleAcceptBooking = async (
    bookingId
  ) => {
    try {
      setActionLoading(`accept-${bookingId}`);

      await acceptBooking(
        user.id,
        bookingId
      );

      showNotification(
        "Booking accepted successfully.",
        "success"
      );

      await loadWorker(true);
    } catch (error) {
      console.error(
        "Accept booking error:",
        error
      );

      showNotification(
        error?.response?.data?.message ||
        "Unable to accept booking.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     REJECT BOOKING
  ========================================================= */

  const handleRejectBooking = async (
    bookingId
  ) => {
    try {
      setActionLoading(`reject-${bookingId}`);

      await rejectBooking(
        user.id,
        bookingId
      );

      showNotification(
        "Booking rejected.",
        "success"
      );

      await loadWorker(true);
    } catch (error) {
      console.error(
        "Reject booking error:",
        error
      );

      showNotification(
        error?.response?.data?.message ||
        "Unable to reject booking.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     COMPLETE SERVICE
  ========================================================= */

  const handleCompleteService = async (
    bookingId
  ) => {
    try {
      setActionLoading(
        `complete-${bookingId}`
      );

      await completeService(
        user.id,
        bookingId
      );

      showNotification(
        "Service marked as completed successfully.",
        "success"
      );

      setShowBookingDetails(false);
      setSelectedBooking(null);

      await loadWorker(true);
    } catch (error) {
      console.error(
        "Complete service error:",
        error
      );

      showNotification(
        error?.response?.data?.message ||
        "Unable to complete service.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

const handleLogout = () => {
  setShowLogoutConfirm(true);
};

const cancelLogout = () => {
  setShowLogoutConfirm(false);
};

const confirmLogout = () => {
  setShowLogoutConfirm(false);
  setShowChat(false);

  logout();

  navigate("/login", {
    replace: true,
  });
};

  /* =========================================================
     HIVECARE AI CHAT SUPPORT
  ========================================================= */

  const openChat = () => {
    setShowChat(true);
  };

  const closeChat = () => {
    if (chatLoading) return;

    setShowChat(false);
  };

  const sendWorkerChatMessage = async (
    messageOverride = null
  ) => {
    const message = (
      messageOverride !== null
        ? messageOverride
        : chatMessage
    ).trim();

    if (!message || chatLoading) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: "user",
        message,
      },
    ]);

    setChatMessage("");
    setChatLoading(true);

    try {
      console.log(
        "Sending worker message to HiveCare AI:",
        message
      );

      const result =
        await sendChatMessageAPI({
          message,
          userName:
            worker?.name ||
            user?.name ||
            "Worker",
          userEmail:
            worker?.email ||
            user?.email ||
            "",
          userRole: "WORKER",
          workerService:
            worker?.service ||
            worker?.specialization ||
            "Not specified",
        });

      console.log(
        "HiveCare AI response:",
        result?.data
      );

      const data = result?.data;

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message:
            data?.reply ||
            "Sorry, I couldn't process your request right now.",
        },
      ]);
    } catch (error) {
      console.error(
        "================================"
      );

      console.error(
        "HIVECARE WORKER CHAT ERROR"
      );

      console.error(
        "================================"
      );

      console.error("Error:", error);

      console.error(
        "Status:",
        error?.response?.status
      );

      console.error(
        "Server response:",
        error?.response?.data
      );

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          message:
            error?.response?.data?.reply ||
            "Sorry 😔 I'm having trouble connecting to HiveCare Support right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleWorkerChatSubmit = (e) => {
    e.preventDefault();

    sendWorkerChatMessage();
  };

  const handleWorkerQuickQuestion = (
    question
  ) => {
    sendWorkerChatMessage(question);
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop =
        chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  /* =========================================================
     SECTION NAVIGATION
  ========================================================= */

  const handleSectionChange = (
    section
  ) => {
    setActiveSection(section);
    setSidebarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     BOOKING HELPERS
  ========================================================= */

  const getStatus = (booking) =>
    booking?.status
      ?.toString()
      .toUpperCase() || "PENDING";

  const formatStatus = (status) => {
    if (!status) return "Pending";

    return status
      .toString()
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    try {
      const parsed = new Date(date);

      if (Number.isNaN(parsed.getTime())) {
        return date;
      }

      return parsed.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "Not specified";

    try {
      const parsed = new Date(date);

      if (Number.isNaN(parsed.getTime())) {
        return date;
      }

      return parsed.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  };

  const formatCurrency = (amount) => {
    const value = Number(amount || 0);

    return `₹${value.toLocaleString("en-IN")}`;
  };

  const getCustomerPhone = (booking) =>
    booking?.customerPhone ||
    booking?.phone ||
    booking?.mobile ||
    booking?.userPhone ||
    "";

  const getCustomerEmail = (booking) =>
    booking?.customerEmail ||
    booking?.email ||
    booking?.userEmail ||
    "";

  const getBookingAddress = (booking) =>
    booking?.address ||
    booking?.location ||
    booking?.customerAddress ||
    "Address not available";

  /* =========================================================
     GOOGLE MAP
  ========================================================= */

  const openGoogleMaps = (booking) => {
    const latitude =
      booking?.latitude ??
      booking?.lat ??
      booking?.locationLatitude;

    const longitude =
      booking?.longitude ??
      booking?.lng ??
      booking?.locationLongitude;

    if (
      latitude !== undefined &&
      latitude !== null &&
      longitude !== undefined &&
      longitude !== null
    ) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    const address =
      getBookingAddress(booking);

    if (
      address &&
      address !== "Address not available"
    ) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          address
        )}`,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    showNotification(
      "Customer location is not available.",
      "error"
    );
  };

  /* =========================================================
     CUSTOMER CALL
  ========================================================= */

  const callCustomer = (booking) => {
    const phone =
      getCustomerPhone(booking);

    if (!phone) {
      showNotification(
        "Customer phone number is not available.",
        "error"
      );

      return;
    }

    window.location.href = `tel:${phone}`;
  };

  /* =========================================================
     WHATSAPP
  ========================================================= */

  const chatCustomer = (booking) => {
    let phone =
      getCustomerPhone(booking);

    if (!phone) {
      showNotification(
        "Customer phone number is not available.",
        "error"
      );

      return;
    }

    phone = phone
      .toString()
      .replace(/\D/g, "");

    if (phone.length === 10) {
      phone = `91${phone}`;
    }

    const message = `Hello ${booking?.name || "Customer"
      }, this is your HiveCare service worker regarding your ${booking?.service || "service"
      } booking.`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(
        message
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =========================================================
     BOOKING MODAL
  ========================================================= */

  const openBookingDetails = (
    booking
  ) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const closeBookingDetails = () => {
    setShowBookingDetails(false);
    setSelectedBooking(null);
  };

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    const completed =
      myBookings.filter(
        (booking) =>
          getStatus(booking) ===
          "COMPLETED"
      );

    const active =
      myBookings.filter(
        (booking) =>
          getStatus(booking) ===
          "ACCEPTED"
      );

    const pending =
      myBookings.filter(
        (booking) =>
          getStatus(booking) ===
          "PENDING"
      );

    const rejected =
      myBookings.filter((booking) => {
        const status =
          getStatus(booking);

        return (
          status === "REJECTED" ||
          status === "REJECT"
        );
      });

    const totalEarnings =
      completed.reduce(
        (total, booking) =>
          total +
          Number(
            booking?.amount || 0
          ),
        0
      );

    return {
      completed: completed.length,
      active: active.length,
      pending: pending.length,
      rejected: rejected.length,
      totalEarnings,
    };
  }, [myBookings]);

  /* =========================================================
     TODAY'S JOBS
  ========================================================= */

  const todayJobs = useMemo(() => {
    const now = new Date();

    const today = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;

    return myBookings.filter(
      (booking) => {
        if (!booking?.date)
          return false;

        return booking.date
          .toString()
          .startsWith(today);
      }
    ).length;
  }, [myBookings]);

  /* =========================================================
     FILTER BOOKINGS
  ========================================================= */

  const filteredBookings = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return myBookings.filter(
      (booking) => {
        const status =
          getStatus(booking);

        const searchableText = [
          booking?.name,
          booking?.service,
          booking?.address,
          booking?.id,
          booking?.course,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !searchValue ||
          searchableText.includes(
            searchValue
          );

        let matchesStatus = true;

        if (statusFilter !== "ALL") {
          if (
            statusFilter ===
            "REJECTED"
          ) {
            matchesStatus =
              status === "REJECTED" ||
              status === "REJECT";
          } else {
            matchesStatus =
              status === statusFilter;
          }
        }

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    myBookings,
    search,
    statusFilter,
  ]);

  /* =========================================================
     SCHEDULE
  ========================================================= */

  const scheduleBookings = useMemo(() => {
    return [...myBookings]
      .filter(
        (booking) =>
          getStatus(booking) ===
          "ACCEPTED"
      )
      .sort((a, b) => {
        return (
          new Date(a?.date || 0) -
          new Date(b?.date || 0)
        );
      });
  }, [myBookings]);

  /* =========================================================
     COMPLETED BOOKINGS
  ========================================================= */

  const completedBookings = useMemo(() => {
    return [...myBookings]
      .filter(
        (booking) =>
          getStatus(booking) ===
          "COMPLETED"
      )
      .sort((a, b) => {
        return (
          new Date(b?.date || 0) -
          new Date(a?.date || 0)
        );
      });
  }, [myBookings]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="worker-loading-page">
        <div className="worker-loading-card">
          <div className="worker-spinner"></div>

          <h3>
            Loading Worker Dashboard
          </h3>

          <p>Please wait...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (

    
    <div className="worker-page">
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="worker-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        ></div>
      )}

      {/* =====================================================
          FIXED SIDEBAR
      ===================================================== */}

      <aside
        className={`worker-sidebar ${sidebarOpen
          ? "worker-sidebar-open"
          : ""
          }`}
      >
        <div className="worker-sidebar-brand">
          <div className="worker-brand-icon">
            <img
              src={logo}
              alt="HiveCare Logo"
              className="hc-logo"
            />
          </div>

          <div>
            <h2>HiveCare</h2>
            <span>Worker Panel</span>
          </div>

          <button
            className="worker-sidebar-close"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {/* Worker mini profile */}
        <div className="worker-sidebar-profile">
          <div className="worker-avatar">
            {(
              worker?.name ||
              user?.name ||
              "W"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="worker-sidebar-profile-info">
            <strong>
              {worker?.name ||
                user?.name ||
                "Worker"}
            </strong>

            <span>
              {worker?.service ||
                worker?.specialization ||
                "Service Professional"}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="worker-sidebar-nav">
          <p className="worker-nav-title">
            MAIN MENU
          </p>

          <button
            className={`worker-nav-item ${activeSection ===
              "dashboard"
              ? "active"
              : ""
              }`}
            onClick={() =>
              handleSectionChange(
                "dashboard"
              )
            }
          >
            <span className="worker-nav-icon">
              🏠
            </span>

            <span>Dashboard</span>
          </button>

          <button
            className={`worker-nav-item ${activeSection ===
              "requests"
              ? "active"
              : ""
              }`}
            onClick={() =>
              handleSectionChange(
                "requests"
              )
            }
          >
            <span className="worker-nav-icon">
              📥
            </span>

            <span>
              Service Requests
            </span>

            {requests.length > 0 && (
              <span className="worker-nav-badge">
                {requests.length}
              </span>
            )}
          </button>

          <button
            className={`worker-nav-item ${activeSection === "jobs"
              ? "active"
              : ""
              }`}
            onClick={() =>
              handleSectionChange("jobs")
            }
          >
            <span className="worker-nav-icon">
              💼
            </span>

            <span>My Jobs</span>
          </button>

          <button
            className={`worker-nav-item ${activeSection ===
              "schedule"
              ? "active"
              : ""
              }`}
            onClick={() =>
              handleSectionChange(
                "schedule"
              )
            }
          >
            <span className="worker-nav-icon">
              📅
            </span>

            <span>My Schedule</span>
          </button>

          <button
            className={`worker-nav-item ${activeSection ===
              "earnings"
              ? "active"
              : ""
              }`}
            onClick={() =>
              handleSectionChange(
                "earnings"
              )
            }
          >
            <span className="worker-nav-icon">
              💰
            </span>

            <span>Earnings</span>
          </button>

          <p className="worker-nav-title worker-nav-title-spaced">
            ACCOUNT
          </p>

          <button
            className={`worker-nav-item ${activeSection ===
              "notifications"
              ? "active"
              : ""
              }`}
            onClick={() =>
              handleSectionChange(
                "notifications"
              )
            }
          >
            <span className="worker-nav-icon">
              🔔
            </span>

            <span>Notifications</span>

            {requests.length > 0 && (
              <span className="worker-nav-badge">
                {requests.length}
              </span>
            )}
          </button>

          <button
            className={`worker-nav-item ${activeSection === "reviews"
              ? "active"
              : ""
              }`}
            onClick={() =>
              handleSectionChange(
                "reviews"
              )
            }
          >
            <span className="worker-nav-icon">
              ⭐
            </span>

            <span>Reviews</span>
          </button>

          <button
            className={`worker-nav-item ${activeSection === "profile"
              ? "active"
              : ""
              }`}
            onClick={() =>
              handleSectionChange(
                "profile"
              )
            }
          >
            <span className="worker-nav-icon">
              👤
            </span>

            <span>My Profile</span>
          </button>

          <button
            className={`worker-nav-item ${activeSection === "support"
              ? "active"
              : ""
              }`}
            onClick={() =>
              handleSectionChange(
                "support"
              )
            }
          >
            <span className="worker-nav-icon">
              💬
            </span>

            <span>Help & Support</span>
          </button>

          <button
            className={`worker-nav-item ${activeSection ===
              "settings"
              ? "active"
              : ""
              }`}
            onClick={() =>
              handleSectionChange(
                "settings"
              )
            }
          >
            <span className="worker-nav-icon">
              ⚙️
            </span>

            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar bottom */}
        <div className="worker-sidebar-bottom">
          <div
            className={`worker-sidebar-status ${worker?.available
              ? "online"
              : "offline"
              }`}
          >
            <span className="status-dot"></span>

            <div>
              <strong>
                {worker?.available
                  ? "Online"
                  : "Offline"}
              </strong>

              <small>
                {worker?.available
                  ? "Accepting requests"
                  : "Not accepting requests"}
              </small>
            </div>
          </div>

          <button
            className="worker-sidebar-logout"
            onClick={handleLogout}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <main className="worker-main">
        {/* Header */}
        <header className="worker-header">
          <div className="worker-header-left">
            <button
              className="worker-menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open menu"
            >
              ☰
            </button>

            <div>
              <h1>
                {activeSection ===
                  "dashboard" &&
                  "Worker Dashboard"}

                {activeSection ===
                  "requests" &&
                  "Service Requests"}

                {activeSection ===
                  "jobs" &&
                  "My Jobs"}

                {activeSection ===
                  "schedule" &&
                  "My Schedule"}

                {activeSection ===
                  "earnings" &&
                  "Earnings"}

                {activeSection ===
                  "notifications" &&
                  "Notifications"}

                {activeSection ===
                  "reviews" &&
                  "Reviews"}

                {activeSection ===
                  "profile" &&
                  "My Profile"}

                {activeSection ===
                  "support" &&
                  "Help & Support"}

                {activeSection ===
                  "settings" &&
                  "Settings"}
              </h1>

              <p>
                Welcome back{" "}
                <strong>
                  {worker?.name ||
                    user?.name ||
                    "Worker"}
                </strong>
              </p>
            </div>
          </div>

          <div className="worker-header-right">
            <button
              className="worker-refresh-button"
              onClick={() =>
                loadWorker(true)
              }
              disabled={refreshing}
              title="Refresh dashboard"
            >
              <span
                className={
                  refreshing
                    ? "refresh-spinning"
                    : ""
                }
              >
                ↻
              </span>

              <span className="refresh-text">
                Refresh
              </span>
            </button>

            <button
              className="worker-header-profile"
              onClick={() =>
                handleSectionChange(
                  "profile"
                )
              }
            >
              <div className="worker-header-avatar">
                {(
                  worker?.name ||
                  user?.name ||
                  "W"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="worker-header-user">
                <strong>
                  {worker?.name ||
                    user?.name ||
                    "Worker"}
                </strong>

                <span>
                  {worker?.available
                    ? "● Online"
                    : "○ Offline"}
                </span>
              </div>
            </button>
          </div>
        </header>

        <div className="worker-container">
          {/* =================================================
              AVAILABILITY BANNER
          ================================================= */}

          <div
            className={`worker-availability-banner ${worker?.available
              ? "available"
              : "unavailable"
              }`}
          >
            <div className="availability-info">
              <div className="availability-icon">
                {worker?.available
                  ? "✓"
                  : "○"}
              </div>

              <div>
                <strong>
                  {worker?.available
                    ? "You are Online"
                    : "You are Offline"}
                </strong>

                <span>
                  {worker?.available
                    ? "You can receive new service requests."
                    : "Turn on availability to receive service requests."}
                </span>
              </div>
            </div>

            <button
              className={`availability-toggle ${worker?.available
                ? "is-online"
                : ""
                }`}
              onClick={
                handleAvailabilityToggle
              }
              disabled={
                availabilityLoading ||
                worker?.blocked
              }
            >
              {availabilityLoading
                ? "Updating..."
                : worker?.available
                  ? "Go Offline"
                  : "Go Online"}
            </button>
          </div>

          {/* =================================================
              DASHBOARD
          ================================================= */}
          
          {activeSection ===
            "dashboard" && (
              <>
                <section className="worker-profile-card">
                  <div className="worker-profile-main">
                    <div className="worker-large-avatar">
                      {(
                        worker?.name ||
                        user?.name ||
                        "W"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h2>
                        {worker?.name ||
                          user?.name ||
                          "Worker"}
                      </h2>

                      <p>
                        {worker?.service ||
                          worker?.specialization ||
                          "HiveCare Service Professional"}
                      </p>

                      <span className="worker-profile-id">
                        Worker ID:{" "}
                        {worker?.id ||
                          user?.id}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`worker-profile-status ${worker?.available
                      ? "online"
                      : "offline"
                      }`}
                  >
                    <span></span>

                    {worker?.available
                      ? "Available"
                      : "Unavailable"}
                  </div>
                </section>

                {/* Stats */}
                <section className="worker-stats-grid">
                  <div
                    className="worker-stat-card requests-stat"
                    onClick={() =>
                      handleSectionChange(
                        "requests"
                      )
                    }
                  >
                    <div className="worker-stat-icon">
                      📥
                    </div>

                    <div>
                      <span>
                        New Requests
                      </span>

                      <strong>
                        {requests.length}
                      </strong>
                    </div>
                  </div>

                  <div
                    className="worker-stat-card active-stat"
                    onClick={() =>
                      handleSectionChange(
                        "jobs"
                      )
                    }
                  >
                    <div className="worker-stat-icon">
                      🔧
                    </div>

                    <div>
                      <span>
                        Active Jobs
                      </span>

                      <strong>
                        {statistics.active}
                      </strong>
                    </div>
                  </div>

                  <div
                    className="worker-stat-card completed-stat"
                    onClick={() =>
                      handleSectionChange(
                        "jobs"
                      )
                    }
                  >
                    <div className="worker-stat-icon">
                      ✓
                    </div>

                    <div>
                      <span>
                        Completed
                      </span>

                      <strong>
                        {statistics.completed}
                      </strong>
                    </div>
                  </div>

                  <div
                    className="worker-stat-card earnings-stat"
                    onClick={() =>
                      handleSectionChange(
                        "earnings"
                      )
                    }
                  >
                    <div className="worker-stat-icon">
                      ₹
                    </div>

                    <div>
                      <span>
                        Total Earnings
                      </span>

                      <strong>
                        {formatCurrency(
                          statistics.totalEarnings
                        )}
                      </strong>
                    </div>
                  </div>
                </section>

                {/* Quick Summary */}
                <section className="worker-section">
                  <div className="worker-section-heading">
                    <div>
                      <h2>
                        Quick Summary
                      </h2>

                      <p>
                        Your current service
                        activity
                      </p>
                    </div>
                  </div>

                  <div className="worker-summary-grid">
                    <div className="worker-summary-card">
                      <span>
                        Pending Jobs
                      </span>

                      <strong>
                        {statistics.pending}
                      </strong>

                      <small>
                        Waiting for action
                      </small>
                    </div>

                    <div className="worker-summary-card">
                      <span>
                        Today's Jobs
                      </span>

                      <strong>
                        {todayJobs}
                      </strong>

                      <small>
                        Scheduled for today
                      </small>
                    </div>

                    <div className="worker-summary-card">
                      <span>
                        Rejected
                      </span>

                      <strong>
                        {statistics.rejected}
                      </strong>

                      <small>
                        Rejected requests
                      </small>
                    </div>

                    <div className="worker-summary-card">
                      <span>
                        Total Jobs
                      </span>

                      <strong>
                        {myBookings.length}
                      </strong>

                      <small>
                        All assigned bookings
                      </small>
                    </div>
                  </div>
                </section>

                {/* Recent Requests */}
                <section className="worker-section">
                  <div className="worker-section-heading">
                    <div>
                      <h2>
                        Recent Service
                        Requests
                      </h2>

                      <p>
                        New bookings waiting
                        for your response
                      </p>
                    </div>

                    <button
                      className="worker-view-all"
                      onClick={() =>
                        handleSectionChange(
                          "requests"
                        )
                      }
                    >
                      View All →
                    </button>
                  </div>

                  {requests.length ===
                    0 ? (
                    <div className="worker-empty-state">
                      <div>📭</div>

                      <h3>
                        No New Requests
                      </h3>

                      <p>
                        New service requests
                        will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="worker-request-grid">
                      {requests
                        .slice(0, 3)
                        .map(
                          (booking) => (
                            <div
                              className="worker-request-card"
                              key={
                                booking.id
                              }
                            >
                              <div className="request-card-top">
                                <div className="request-service-icon">
                                  🔧
                                </div>

                                <span className="request-new-badge">
                                  NEW
                                </span>
                              </div>

                              <h3>
                                {booking.service ||
                                  "Service"}
                              </h3>

                              <p className="request-customer">
                                👤{" "}
                                {booking.name ||
                                  "Customer"}
                              </p>

                              <p>
                                📅{" "}
                                {formatDate(
                                  booking.date
                                )}
                              </p>
                              <p>
                                <i className="bi bi-clock"></i>{" "}
                                {booking.timeSlot || "Not specified"}
                              </p>
                              <p className="request-address">
                                📍{" "}
                                {getBookingAddress(
                                  booking
                                )}
                              </p>

                              <div className="request-card-bottom">
                                <strong>
                                  {formatCurrency(
                                    booking.amount
                                  )}
                                </strong>

                                <button
                                  onClick={() =>
                                    openBookingDetails(
                                      booking
                                    )
                                  }
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  )}
                </section>

                {/* Tips */}
                <section className="worker-tips-card">
                  <div className="worker-tips-icon">
                    💡
                  </div>

                  <div>
                    <h3>
                      Worker Tip
                    </h3>

                    <p>
                      Keep your availability
                      updated so customers
                      can get faster
                      service. Always check
                      the customer address
                      before starting your
                      journey.
                    </p>
                  </div>
                </section>
              </>
            )}

          {/* =================================================
              SERVICE REQUESTS
          ================================================= */}

          {activeSection ===
            "requests" && (
              <section className="worker-section">
                <div className="worker-section-heading">
                  <div>
                    <h2>
                      Service Requests
                    </h2>

                    <p>
                      Review and respond to
                      customer bookings.
                    </p>
                  </div>

                  <span className="worker-section-count">
                    {requests.length}{" "}
                    Requests
                  </span>
                </div>

                {requests.length ===
                  0 ? (
                  <div className="worker-empty-state large">
                    <div>📭</div>

                    <h3>
                      No Service Requests
                    </h3>

                    <p>
                      You currently have no
                      new requests.
                    </p>
                  </div>
                ) : (
                  <div className="worker-request-list">
                    {requests.map(
                      (booking) => (
                        <div
                          className="worker-full-request-card"
                          key={
                            booking.id
                          }
                        >
                          <div className="full-request-main">
                            <div className="full-request-icon">
                              🔧
                            </div>

                            <div>
                              <div className="full-request-title">
                                <h3>
                                  {booking.service ||
                                    "Service"}
                                </h3>

                                <span className="request-new-badge">
                                  NEW
                                </span>
                              </div>

                              <div className="full-request-details">
                                <span>
                                  👤{" "}
                                  {booking.name ||
                                    "Customer"}
                                </span>

                                <span>
                                  📅{" "}
                                  {formatDate(
                                    booking.date
                                  )}
                                </span>
                                <span>
                                  🕐{" "}
                                  {booking.timeSlot ||
                                    "Not specified"}
                                </span>
                                <span>
                                  📍{" "}
                                  {getBookingAddress(
                                    booking
                                  )}
                                </span>

                                <span>
                                  💳{" "}
                                  {booking.paymentMethod ||
                                    "Not specified"}
                                </span>
                              </div>

                              {booking.course && (
                                <p className="request-course">
                                  Course:{" "}
                                  {
                                    booking.course
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="full-request-side">
                            <strong>
                              {formatCurrency(
                                booking.amount
                              )}
                            </strong>

                            <div className="request-actions">
                              <button
                                className="worker-secondary-button"
                                onClick={() =>
                                  openBookingDetails(
                                    booking
                                  )
                                }
                              >
                                View Details
                              </button>

                              <button
                                className="worker-reject-button"
                                onClick={() =>
                                  handleRejectBooking(
                                    booking.id
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  `reject-${booking.id}`
                                }
                              >
                                {actionLoading ===
                                  `reject-${booking.id}`
                                  ? "Rejecting..."
                                  : "Reject"}
                              </button>

                              <button
                                className="worker-accept-button"
                                onClick={() =>
                                  handleAcceptBooking(
                                    booking.id
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  `accept-${booking.id}`
                                }
                              >
                                {actionLoading ===
                                  `accept-${booking.id}`
                                  ? "Accepting..."
                                  : "Accept"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>
            )}

            {showLogoutConfirm && (
  <div
    className="hc-worker-logout-overlay"
    onClick={cancelLogout}
  >
    <div
      className="hc-worker-logout-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="hc-worker-logout-icon">
        🚪
      </div>

      <h2 className="hc-worker-logout-title">
        Logout?
      </h2>

      <p className="hc-worker-logout-message">
        Are you sure you want to logout from your
        HiveCare Worker account?
      </p>

      <div className="hc-worker-logout-buttons">
        <button
          type="button"
          className="hc-worker-logout-button hc-worker-logout-cancel"
          onClick={cancelLogout}
        >
          Cancel
        </button>

        <button
          type="button"
          className="hc-worker-logout-button hc-worker-logout-confirm"
          onClick={confirmLogout}
        >
          Yes, Logout
        </button>
      </div>
    </div>
  </div>
)}
          {/* =================================================
              MY JOBS
          ================================================= */}

          {activeSection === "jobs" && (
            <section className="worker-section">
              <div className="worker-section-heading">
                <div>
                  <h2>My Jobs</h2>

                  <p>
                    Manage all your
                    assigned bookings.
                  </p>
                </div>
              </div>

              <div className="worker-jobs-toolbar">
                <div className="worker-search-box">
                  <span>🔍</span>

                  <input
                    type="text"
                    placeholder="Search customer, service, address..."
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="worker-status-filter"
                >
                  <option value="ALL">
                    All Status
                  </option>

                  <option value="PENDING">
                    Pending
                  </option>

                  <option value="ACCEPTED">
                    Accepted
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>
                </select>
              </div>

              {filteredBookings.length ===
                0 ? (
                <div className="worker-empty-state large">
                  <div>📋</div>

                  <h3>
                    No Jobs Found
                  </h3>

                  <p>
                    No bookings match your
                    current search or
                    filter.
                  </p>
                </div>
              ) : (
                <div className="worker-table-wrapper">
                  <table className="worker-jobs-table">
                    <thead>
                      <tr>
                        <th>
                          Booking
                        </th>

                        <th>
                          Customer
                        </th>

                        <th>
                          Service
                        </th>

                        <th>Date</th>
                        <th>
                          Time Slot
                        </th>
                        <th>
                          Amount
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredBookings.map(
                        (booking) => {
                          const status =
                            getStatus(
                              booking
                            );

                          return (
                            <tr
                              key={
                                booking.id
                              }
                            >
                              <td>
                                <strong>
                                  #
                                  {
                                    booking.id
                                  }
                                </strong>
                              </td>

                              <td>
                                <div className="table-customer">
                                  <div className="table-avatar">
                                    {(
                                      booking.name ||
                                      "C"
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <span>
                                    {booking.name ||
                                      "Customer"}
                                  </span>
                                </div>
                              </td>

                              <td>
                                {booking.service ||
                                  "Service"}
                              </td>

                              <td>
                                {formatDate(
                                  booking.date
                                )}
                              </td>
                              <td>
                                {booking.timeSlot ||
                                  "Not specified"}
                              </td>
                              <td>
                                <strong>
                                  {formatCurrency(
                                    booking.amount
                                  )}
                                </strong>
                              </td>

                              <td>
                                <span
                                  className={`worker-status-pill ${status.toLowerCase()}`}
                                >
                                  {formatStatus(
                                    status
                                  )}
                                </span>
                              </td>

                              <td>
                                <button
                                  className="worker-view-button"
                                  onClick={() =>
                                    openBookingDetails(
                                      booking
                                    )
                                  }
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* =================================================
              SCHEDULE
          ================================================= */}

          {activeSection ===
            "schedule" && (
              <section className="worker-section">
                <div className="worker-section-heading">
                  <div>
                    <h2>
                      My Schedule
                    </h2>

                    <p>
                      Your upcoming accepted
                      services.
                    </p>
                  </div>
                </div>

                {scheduleBookings.length ===
                  0 ? (
                  <div className="worker-empty-state large">
                    <div>📅</div>

                    <h3>
                      No Upcoming Jobs
                    </h3>

                    <p>
                      Accepted bookings will
                      appear in your
                      schedule.
                    </p>
                  </div>
                ) : (
                  <div className="worker-schedule-list">
                    {scheduleBookings.map(
                      (booking) => (
                        <div
                          className="worker-schedule-card"
                          key={
                            booking.id
                          }
                        >
                          <div className="schedule-date">
                            <span>
                              {booking.date
                                ? new Date(
                                  booking.date
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                  }
                                )
                                : "--"}
                            </span>

                            <small>
                              {booking.date
                                ? new Date(
                                  booking.date
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    month: "short",
                                  }
                                )
                                : ""}
                            </small>
                          </div>

                          <div className="schedule-info">
                            <h3>
                              {booking.service ||
                                "Service"}
                            </h3>

                            <p>
                              👤{" "}
                              {booking.name ||
                                "Customer"}
                            </p>
                            <p>
                              🕐{" "}
                              {booking.timeSlot ||
                                "Not specified"}
                            </p>
                            <p>
                              📍{" "}
                              {getBookingAddress(
                                booking
                              )}
                            </p>

                            <span>
                              Booking #
                              {
                                booking.id
                              }
                            </span>
                          </div>

                          <div className="schedule-actions">
                            <strong>
                              {formatCurrency(
                                booking.amount
                              )}
                            </strong>

                            <button
                              className="worker-view-button"
                              onClick={() =>
                                openBookingDetails(
                                  booking
                                )
                              }
                            >
                              View
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>
            )}

          {/* =================================================
              EARNINGS
          ================================================= */}

          {activeSection ===
            "earnings" && (
              <section className="worker-section">
                <div className="worker-section-heading">
                  <div>
                    <h2>Earnings</h2>

                    <p>
                      Track your completed
                      service earnings.
                    </p>
                  </div>
                </div>

                <div className="worker-earnings-hero">
                  <div className="earnings-hero-icon">
                    ₹
                  </div>

                  <div>
                    <span>
                      Total Earnings
                    </span>

                    <strong>
                      {formatCurrency(
                        statistics.totalEarnings
                      )}
                    </strong>

                    <small>
                      From{" "}
                      {
                        statistics.completed
                      }{" "}
                      completed service
                      {statistics.completed !==
                        1
                        ? "s"
                        : ""}
                    </small>
                  </div>
                </div>

                <div className="worker-earnings-stats">
                  <div>
                    <span>
                      Completed Services
                    </span>

                    <strong>
                      {
                        statistics.completed
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Active Services
                    </span>

                    <strong>
                      {
                        statistics.active
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Pending Services
                    </span>

                    <strong>
                      {
                        statistics.pending
                      }
                    </strong>
                  </div>
                </div>

                <div className="worker-section-subheading">
                  <h3>
                    Completed Services
                  </h3>
                </div>

                {completedBookings.length ===
                  0 ? (
                  <div className="worker-empty-state">
                    <div>💰</div>

                    <h3>
                      No Completed Services
                    </h3>

                    <p>
                      Your completed service
                      earnings will appear
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="worker-earnings-list">
                    {completedBookings.map(
                      (booking) => (
                        <div
                          className="worker-earning-row"
                          key={
                            booking.id
                          }
                        >
                          <div className="earning-row-icon">
                            ✓
                          </div>

                          <div className="earning-row-info">
                            <strong>
                              {booking.service ||
                                "Service"}
                            </strong>

                            <span>
                              {booking.name ||
                                "Customer"}{" "}
                              •{" "}
                              {formatDate(
                                booking.date
                              )}
                              {booking.timeSlot && (
                                <>
                                  {" "}•{" "}
                                  {booking.timeSlot}
                                </>
                              )}
                            </span>
                          </div>

                          <strong>
                            {formatCurrency(
                              booking.amount
                            )}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>
            )}

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          {activeSection ===
            "notifications" && (
              <section className="worker-section">
                <div className="worker-section-heading">
                  <div>
                    <h2>
                      Notifications
                    </h2>

                    <p>
                      Stay updated with your
                      HiveCare activities.
                    </p>
                  </div>
                </div>

                <div className="worker-notification-list">
                  {requests.length > 0 && (
                    <div className="worker-notification-card unread">
                      <div className="notification-card-icon">
                        📥
                      </div>

                      <div>
                        <strong>
                          New Service
                          Requests
                        </strong>

                        <p>
                          You have{" "}
                          {requests.length}{" "}
                          new service
                          request
                          {requests.length !==
                            1
                            ? "s"
                            : ""}{" "}
                          waiting for your
                          response.
                        </p>
                      </div>
                    </div>
                  )}

                  {statistics.active >
                    0 && (
                      <div className="worker-notification-card">
                        <div className="notification-card-icon">
                          🔧
                        </div>

                        <div>
                          <strong>
                            Active Services
                          </strong>

                          <p>
                            You currently
                            have{" "}
                            {
                              statistics.active
                            }{" "}
                            active service
                            {statistics.active !==
                              1
                              ? "s"
                              : ""}.
                          </p>
                        </div>
                      </div>
                    )}

                  {statistics.completed >
                    0 && (
                      <div className="worker-notification-card">
                        <div className="notification-card-icon">
                          ✓
                        </div>

                        <div>
                          <strong>
                            Services
                            Completed
                          </strong>

                          <p>
                            You have
                            completed{" "}
                            {
                              statistics.completed
                            }{" "}
                            service
                            {statistics.completed !==
                              1
                              ? "s"
                              : ""}.
                          </p>
                        </div>
                      </div>
                    )}

                  {requests.length ===
                    0 &&
                    statistics.active ===
                    0 &&
                    statistics.completed ===
                    0 && (
                      <div className="worker-empty-state large">
                        <div>🔔</div>

                        <h3>
                          No Notifications
                        </h3>

                        <p>
                          You are all caught
                          up.
                        </p>
                      </div>
                    )}
                </div>
              </section>
            )}

          {/* =================================================
              REVIEWS
          ================================================= */}

          {activeSection ===
            "reviews" && (
              <section className="worker-section">
                <div className="worker-section-heading">
                  <div>
                    <h2>Reviews</h2>

                    <p>
                      Customer feedback
                      about your services.
                    </p>
                  </div>
                </div>

                {reviews.length === 0 ? (

                  <div className="worker-review-placeholder">

                    <div className="review-placeholder-icon">
                      ⭐
                    </div>

                    <h3>
                      Customer Reviews
                    </h3>

                    <p>
                      Your customer reviews and ratings
                      will appear here once customers
                      submit feedback.
                    </p>

                    <div className="review-placeholder-stars">
                      ☆ ☆ ☆ ☆ ☆
                    </div>

                  </div>

                ) : (

                  <div className="worker-reviews-container">

                    <div className="worker-review-summary">

                      <div className="worker-average-rating">

                        <strong>
                          {averageRating}
                        </strong>

                        <div className="worker-average-stars">

                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={
                                star <=
                                  Math.round(
                                    Number(averageRating)
                                  )
                                  ? "filled"
                                  : ""
                              }
                            >
                              ★
                            </span>
                          ))}

                        </div>

                        <small>
                          {reviews.length} review
                          {reviews.length !== 1 ? "s" : ""}
                        </small>

                      </div>

                    </div>

                    <div className="worker-reviews-list">

                      {reviews.map((review) => (

                        <div
                          className="worker-review-card"
                          key={review.id}
                        >

                          <div className="worker-review-header">

                            <div className="worker-review-customer">

                              <div className="worker-review-avatar">
                                {(review.customerName ||
                                  "Customer")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <strong>
                                  {review.customerName ||
                                    "Customer"}
                                </strong>

                                <span>
                                  {review.service ||
                                    "HiveCare Service"}
                                </span>

                              </div>

                            </div>

                            <div className="worker-review-date">

                              {review.createdAt
                                ? new Date(
                                  review.createdAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                                : ""}

                            </div>

                          </div>

                          <div className="worker-review-rating">

                            {[1, 2, 3, 4, 5].map((star) => (

                              <span
                                key={star}
                                className={
                                  star <=
                                    Number(
                                      review.rating || 0
                                    )
                                    ? "filled"
                                    : ""
                                }
                              >
                                ★
                              </span>

                            ))}

                            <strong>
                              {review.rating || 0}/5
                            </strong>

                          </div>

                          <p className="worker-review-comment">

                            {review.comment ||
                              "No written comment."}

                          </p>

                        </div>

                      ))}

                    </div>

                  </div>

                )}
              </section>
            )}

          {/* =================================================
              PROFILE
          ================================================= */}

          {activeSection ===
            "profile" && (
              <section className="worker-section">
                <div className="worker-section-heading">
                  <div>
                    <h2>My Profile</h2>

                    <p>
                      View your worker
                      account details.
                    </p>
                  </div>
                </div>

                <div className="worker-profile-details-card">
                  <div className="profile-details-header">
                    <div className="worker-large-avatar">
                      {(
                        worker?.name ||
                        user?.name ||
                        "W"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h2>
                        {worker?.name ||
                          user?.name ||
                          "Worker"}
                      </h2>

                      <span>
                        Worker ID:{" "}
                        {worker?.id ||
                          user?.id}
                      </span>
                    </div>
                  </div>

                  <div className="profile-details-grid">
                    <div>
                      <label>
                        Name
                      </label>

                      <strong>
                        {worker?.name ||
                          user?.name ||
                          "Not available"}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Email
                      </label>

                      <strong>
                        {worker?.email ||
                          user?.email ||
                          "Not available"}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Phone
                      </label>

                      <strong>
                        {worker?.phone ||
                          worker?.mobile ||
                          "Not available"}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Service
                      </label>

                      <strong>
                        {worker?.service ||
                          worker?.specialization ||
                          "Not available"}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Status
                      </label>

                      <strong>
                        {worker?.available
                          ? "Online"
                          : "Offline"}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Account
                      </label>

                      <strong>
                        {worker?.blocked
                          ? "Blocked"
                          : "Active"}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>
            )}

          {/* =================================================
              SUPPORT
          ================================================= */}

          {activeSection ===
            "support" && (
              <section className="worker-section">
                <div className="worker-section-heading">
                  <div>
                    <h2>
                      Help & Support
                    </h2>

                    <p>
                      Get assistance with
                      your HiveCare account
                      and services.
                    </p>
                  </div>
                </div>

                <div className="worker-support-grid">
                  <div className="worker-support-card">
                    <div>📞</div>

                    <h3>
                      Call Support
                    </h3>

                    <p>
                      Speak with the HiveCare
                      support team.
                    </p>

                    <a href="tel:+916299186350">
                      +91 62991 86350
                    </a>
                  </div>

                  <div className="worker-support-card">
                    <div>✉️</div>

                    <h3>
                      Email Support
                    </h3>

                    <p>
                      Send your questions to
                      our support team.
                    </p>

                    <a href="mailto:hivecare2@gmail.com">
                      hivecare2@gmail.com
                    </a>
                  </div>

                  <div className="worker-support-card">
                    <div>💬</div>

                    <h3>
                      Chat Support
                    </h3>

                    <p>
                      Get quick assistance from
                      HiveCare support.
                    </p>

                    <button
                      type="button"
                      onClick={openChat}
                    >
                      Start Chat
                    </button>
                  </div>
                </div>
              </section>
            )}

          {/* =================================================
              SETTINGS
          ================================================= */}

          {activeSection ===
            "settings" && (
              <section className="worker-section">
                <div className="worker-section-heading">
                  <div>
                    <h2>Settings</h2>

                    <p>
                      Manage your worker
                      dashboard preferences.
                    </p>
                  </div>
                </div>

                <div className="worker-settings-card">
                  <div className="worker-setting-row">
                    <div>
                      <strong>
                        Service Availability
                      </strong>

                      <p>
                        Control whether you
                        receive new service
                        requests.
                      </p>
                    </div>

                    <button
                      className={`worker-setting-toggle ${worker?.available
                        ? "active"
                        : ""
                        }`}
                      onClick={
                        handleAvailabilityToggle
                      }
                      disabled={
                        availabilityLoading ||
                        worker?.blocked
                      }
                    >
                      <span></span>

                      {worker?.available
                        ? "Online"
                        : "Offline"}
                    </button>
                  </div>

                  <div className="worker-setting-row">
                    <div>
                      <strong>
                        Dashboard Refresh
                      </strong>

                      <p>
                        Refresh your worker
                        data.
                      </p>
                    </div>

                    <button
                      className="worker-secondary-button"
                      onClick={() =>
                        loadWorker(true)
                      }
                      disabled={
                        refreshing
                      }
                    >
                      {refreshing
                        ? "Refreshing..."
                        : "Refresh Now"}
                    </button>
                  </div>

                  <div className="worker-setting-row danger-setting">
                    <div>
                      <strong>
                        Sign Out
                      </strong>

                      <p>
                        Sign out of your
                        HiveCare worker
                        account.
                      </p>
                    </div>

                    <button
                      className="worker-danger-button"
                      onClick={
                        handleLogout
                      }
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </section>
            )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="worker-footer">
            <div>
              <strong>HiveCare</strong>

              <span>
                Professional Home Services
              </span>
            </div>

            <p>
              ©{" "}
              {new Date().getFullYear()}{" "}
              HiveCare. All rights
              reserved.
            </p>
          </footer>
        </div>
      </main>

      {/* =====================================================
          NOTIFICATION
      ===================================================== */}

      {notification && (
        <div
          className={`worker-toast ${notification.type}`}
        >
          <span>
            {notification.type ===
              "success"
              ? "✓"
              : "!"}
          </span>

          <p>
            {notification.message}
          </p>

          <button
            onClick={() =>
              setNotification(null)
            }
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          BOOKING DETAILS MODAL
      ===================================================== */}

      {showBookingDetails &&
        selectedBooking && (
          <div
            className="worker-modal-overlay"
            onClick={
              closeBookingDetails
            }
          >
            <div
              className="worker-booking-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="worker-modal-header">
                <div>
                  <span>
                    Booking #
                    {
                      selectedBooking.id
                    }
                  </span>

                  <h2>
                    {selectedBooking.service ||
                      "Service Details"}
                  </h2>
                </div>

                <button
                  className="worker-modal-close"
                  onClick={
                    closeBookingDetails
                  }
                >
                  ×
                </button>
              </div>

              <div className="worker-modal-body">
                <div className="worker-modal-status-row">
                  <span
                    className={`worker-status-pill ${getStatus(
                      selectedBooking
                    ).toLowerCase()}`}
                  >
                    {formatStatus(
                      getStatus(
                        selectedBooking
                      )
                    )}
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedBooking.amount
                    )}
                  </strong>
                </div>

                {/* Customer */}
                <div className="worker-modal-section">
                  <h3>
                    👤 Customer
                    Information
                  </h3>

                  <div className="worker-detail-grid">
                    <div>
                      <label>
                        Name
                      </label>

                      <strong>
                        {selectedBooking.name ||
                          "Not available"}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Phone
                      </label>

                      <strong>
                        {getCustomerPhone(
                          selectedBooking
                        ) ||
                          "Not available"}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Email
                      </label>

                      <strong>
                        {getCustomerEmail(
                          selectedBooking
                        ) ||
                          "Not available"}
                      </strong>
                    </div>
                    <div>
                      <label>
                        Time Slot
                      </label>

                      <strong>
                        {selectedBooking.timeSlot ||
                          "Not specified"}
                      </strong>
                    </div>

                  </div>
                </div>

                {/* Service */}
                <div className="worker-modal-section">
                  <h3>
                    🔧 Service
                    Information
                  </h3>

                  <div className="worker-detail-grid">
                    <div>
                      <label>
                        Service
                      </label>

                      <strong>
                        {selectedBooking.service ||
                          "Not available"}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Date
                      </label>

                      <strong>
                        {formatDate(
                          selectedBooking.date
                        )}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Payment Method
                      </label>

                      <strong>
                        {selectedBooking.paymentMethod ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Payment Timing
                      </label>

                      <strong>
                        {selectedBooking.paymentTiming ||
                          "Not specified"}
                      </strong>
                    </div>

                    {selectedBooking.course && (
                      <div>
                        <label>
                          Course
                        </label>

                        <strong>
                          {
                            selectedBooking.course
                          }
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="worker-modal-section">
                  <h3>
                    📍 Customer Address
                  </h3>

                  <div className="worker-address-box">
                    {getBookingAddress(
                      selectedBooking
                    )}
                  </div>
                </div>

                {/* Map */}
                <div className="worker-modal-section">
                  <h3>
                    🗺️ Customer Location
                  </h3>

                  <div className="worker-map-wrapper">
                    <BookingMap
                      latitude={
                        selectedBooking.latitude
                      }
                      longitude={
                        selectedBooking.longitude
                      }
                      address={getBookingAddress(
                        selectedBooking
                      )}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="worker-modal-actions">
                  <button
                    className="worker-map-button"
                    onClick={() =>
                      openGoogleMaps(
                        selectedBooking
                      )
                    }
                  >
                    🗺️ Navigate to
                    Customer
                  </button>

                  {getCustomerPhone(
                    selectedBooking
                  ) && (
                      <>
                        <button
                          className="worker-call-button"
                          onClick={() =>
                            callCustomer(
                              selectedBooking
                            )
                          }
                        >
                          📞 Call Customer
                        </button>

                        <button
                          className="worker-chat-button"
                          onClick={() =>
                            chatCustomer(
                              selectedBooking
                            )
                          }
                        >
                          💬 Chat Customer
                        </button>
                      </>
                    )}
                </div>

                {/* Status Actions */}
                <div className="worker-booking-action-row">
                  {getStatus(
                    selectedBooking
                  ) === "PENDING" && (
                      <>
                        <button
                          className="worker-reject-button large-action"
                          onClick={() =>
                            handleRejectBooking(
                              selectedBooking.id
                            )
                          }
                          disabled={
                            actionLoading ===
                            `reject-${selectedBooking.id}`
                          }
                        >
                          {actionLoading ===
                            `reject-${selectedBooking.id}`
                            ? "Rejecting..."
                            : "Reject Booking"}
                        </button>

                        <button
                          className="worker-accept-button large-action"
                          onClick={() =>
                            handleAcceptBooking(
                              selectedBooking.id
                            )
                          }
                          disabled={
                            actionLoading ===
                            `accept-${selectedBooking.id}`
                          }
                        >
                          {actionLoading ===
                            `accept-${selectedBooking.id}`
                            ? "Accepting..."
                            : "Accept Booking"}
                        </button>
                      </>
                    )}

                  {getStatus(
                    selectedBooking
                  ) === "ACCEPTED" && (
                      <button
                        className="worker-complete-button large-action full-width"
                        onClick={() =>
                          handleCompleteService(
                            selectedBooking.id
                          )
                        }
                        disabled={
                          actionLoading ===
                          `complete-${selectedBooking.id}`
                        }
                      >
                        {actionLoading ===
                          `complete-${selectedBooking.id}`
                          ? "Completing..."
                          : "✓ Mark Service Completed"}
                      </button>
                    )}

                  {getStatus(
                    selectedBooking
                  ) === "COMPLETED" && (
                      <div className="worker-completed-message">
                        ✓ This service has been
                        completed.
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          HIVECARE AI CHAT WINDOW

          This is an overlay and does not change the
          existing Worker Dashboard layout.
      ===================================================== */}

      {showChat && (
        <div
          className="hc-chat-overlay"
          onClick={closeChat}
        >
          <div
            className="hc-chat-window"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Chat Header */}
            <div className="hc-chat-header">
              <div className="hc-chat-brand">
                <div className="hc-chat-avatar">
                  <i className="bi bi-hexagon-fill"></i>
                </div>

                <div>
                  <strong>
                    HiveCare Support
                  </strong>

                  <span>
                    <span className="hc-online-dot"></span>
                    AI Assistant
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="hc-chat-close"
                onClick={closeChat}
                disabled={chatLoading}
                aria-label="Close chat"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Chat Messages */}
            <div
              className="hc-chat-body"
              ref={chatBodyRef}
            >
              {chatMessages.map(
                (chat, index) => (
                  <div
                    key={index}
                    className={`hc-chat-message-row ${chat.sender ===
                      "user"
                      ? "hc-chat-user-row"
                      : "hc-chat-bot-row"
                      }`}
                  >
                    {chat.sender ===
                      "bot" && (
                        <div className="hc-message-avatar">
                          <i className="bi bi-hexagon-fill"></i>
                        </div>
                      )}

                    <div
                      className={`hc-chat-message ${chat.sender ===
                        "user"
                        ? "hc-chat-user-message"
                        : "hc-chat-bot-message"
                        }`}
                    >
                      {chat.message}
                    </div>
                  </div>
                )
              )}

              {/* Typing Indicator */}
              {chatLoading && (
                <div className="hc-chat-message-row hc-chat-bot-row">
                  <div className="hc-message-avatar">
                    <i className="bi bi-hexagon-fill"></i>
                  </div>

                  <div className="hc-chat-message hc-chat-bot-message hc-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions */}
            {!chatLoading &&
              chatMessages.length <=
              2 && (
                <div className="hc-quick-questions">
                  <button
                    type="button"
                    onClick={() =>
                      handleWorkerQuickQuestion(
                        "How can I accept a service request?"
                      )
                    }
                  >
                    <i className="bi bi-check-circle"></i>

                    Service Requests
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleWorkerQuickQuestion(
                        "How can I check my assigned jobs?"
                      )
                    }
                  >
                    <i className="bi bi-briefcase"></i>

                    My Jobs
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleWorkerQuickQuestion(
                        "How can I update my availability?"
                      )
                    }
                  >
                    <i className="bi bi-toggle-on"></i>

                    Availability
                  </button>
                </div>
              )}

            {/* Chat Input */}
            <form
              className="hc-chat-input-area"
              onSubmit={
                handleWorkerChatSubmit
              }
            >
              <input
                type="text"
                placeholder="Ask HiveCare anything..."
                value={chatMessage}
                onChange={(e) =>
                  setChatMessage(
                    e.target.value
                  )
                }
                disabled={chatLoading}
              />

              <button
                type="submit"
                disabled={
                  chatLoading ||
                  !chatMessage.trim()
                }
                aria-label="Send message"
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </form>

            {/* Footer */}
            <div className="hc-chat-footer">
              HiveCare AI Support
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;