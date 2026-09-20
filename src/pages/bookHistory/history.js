import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { useAuth } from "../../context/AuthContext";
import {
  createReview,
  getBookingReview,
  getUserBookings,
  updateBooking,
  cancelBooking,
  getPaymentReceipt,
  createPaymentOrder,
  verifyPayment
} from "../../api/api";

import "./history.css";

function History() {
  // =====================================================
// AUTHENTICATED USER
// =====================================================

const { user, loading: authLoading } = useAuth();

  // =====================================================
  // STATE
  // =====================================================

  const [bookings, setBookings] = useState([]);

  const [editingBooking, setEditingBooking] = useState(null);

  const [loading, setLoading] = useState(true);

  const [receipt, setReceipt] = useState(null);

  const [showReceipt, setShowReceipt] = useState(false);

  const [cancelling, setCancelling] = useState(null);

  const [cancelBookingId, setCancelBookingId] = useState(null);
const [showCancelPopup, setShowCancelPopup] = useState(false);

  // =====================================================
  // REVIEW STATE
  // =====================================================

  const [reviewBooking, setReviewBooking] = useState(null);

  const [reviewRating, setReviewRating] = useState(0);

  const [reviewComment, setReviewComment] = useState("");

  const [reviewLoading, setReviewLoading] = useState(false);

  const [reviewedBookings, setReviewedBookings] = useState({});

  // =====================================================
  // NOTIFICATION STATE
  // =====================================================

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    text: ""
  });

  // =====================================================
  // SHOW NOTIFICATION
  // =====================================================

  const showNotification = (type, title, text) => {
    setNotification({
      show: true,
      type,
      title,
      text
    });

    setTimeout(() => {
      setNotification({
        show: false,
        type: "success",
        title: "",
        text: ""
      });
    }, 4000);
  };

  // =====================================================
  // CLOSE NOTIFICATION
  // =====================================================

  const closeNotification = () => {
    setNotification({
      show: false,
      type: "success",
      title: "",
      text: ""
    });
  };

  // =====================================================
  // OPEN REVIEW MODAL
  // =====================================================

  const openReviewModal = async (booking) => {
    try {
      const response = await getBookingReview(booking.id);

      // Existing review found
      if (response?.status === 200 && response.data) {
        setReviewedBookings((prev) => ({
          ...prev,
          [booking.id]: true
        }));

        showNotification(
          "info",
          "Already Reviewed",
          "You have already reviewed this service."
        );

        return;
      }
    } catch (error) {
      // 204 / 404 means no review exists yet.
      if (
        error?.response?.status !== 204 &&
        error?.response?.status !== 404
      ) {
        console.error("Unable to check existing review:", error);
      }
    }

    // =================================================
    // WORKER ID
    // =================================================

    const workerId =
      booking.workerId ||
      booking.worker?.id ||
      booking.worker?.workerId;

    if (!workerId) {
      showNotification(
        "error",
        "Worker Not Assigned",
        "A worker must be assigned before you can review this service."
      );

      return;
    }

    // =================================================
    // OPEN MODAL
    // =================================================

    setReviewBooking({
      ...booking,
      workerId
    });

    setReviewRating(0);

    setReviewComment("");
  };

  // =====================================================
  // CLOSE REVIEW MODAL
  // =====================================================

  const closeReviewModal = () => {
    if (reviewLoading) {
      return;
    }

    setReviewBooking(null);

    setReviewRating(0);

    setReviewComment("");
  };

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const submitReview = async () => {
    if (!reviewBooking) {
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      showNotification(
        "error",
        "Rating Required",
        "Please select a rating from 1 to 5 stars."
      );

      return;
    }

    const workerId =
      reviewBooking.workerId ||
      reviewBooking.worker?.id ||
      reviewBooking.worker?.workerId;

    if (!workerId) {
      showNotification(
        "error",
        "Worker Not Found",
        "The assigned worker could not be found."
      );

      return;
    }

    setReviewLoading(true);

    try {
      const reviewData = {
        bookingId: reviewBooking.id,

        userId:
          reviewBooking.userId ||
          user?.id,

        workerId: workerId,

        service:
          reviewBooking.service ||
          "",

        rating:
          reviewRating,

        comment:
          reviewComment.trim()
      };

      console.log("Submitting review:", reviewData);

      await createReview(reviewData);

      // Mark booking as reviewed
      setReviewedBookings((prev) => ({
        ...prev,
        [reviewBooking.id]: true
      }));

      // Close modal
      setReviewBooking(null);

      setReviewRating(0);

      setReviewComment("");

      showNotification(
        "success",
        "Review Submitted",
        "Your review has been submitted successfully."
      );
    } catch (error) {
      console.error(
        "Review submission failed:",
        error
      );

      console.error(
        "Review backend response:",
        error?.response?.data
      );

      // If backend says review already exists
      if (
        error?.response?.status === 409 ||
        error?.response?.status === 400 &&
        String(error?.response?.data || "")
          .toLowerCase()
          .includes("already")
      ) {
        setReviewedBookings((prev) => ({
          ...prev,
          [reviewBooking.id]: true
        }));

        setReviewBooking(null);

        showNotification(
          "info",
          "Already Reviewed",
          "You have already reviewed this service."
        );

        return;
      }

      showNotification(
        "error",
        "Review Failed",
        error?.response?.data?.message ||
        error?.response?.data ||
        "Unable to submit review. Please try again."
      );
    } finally {
      setReviewLoading(false);
    }
  };

 useEffect(() => {
  // Wait until AuthContext finishes checking the JWT
  if (authLoading) {
    return;
  }

  // No authenticated user
  if (!user) {
    setLoading(false);
    return;
  }

  loadBookings();
}, [user, authLoading]);

  // =====================================================
  // LOAD BOOKINGS - NEWEST FIRST
  // =====================================================

  const loadBookings = async () => {
    try {
      setLoading(true);

      const response = await getUserBookings(user.id);

      console.log(
        "USER BOOKINGS:",
        response.data
      );

      // =================================================
      // SORT NEWEST BOOKING FIRST
      // =================================================

      const sortedBookings = [
        ...(response.data || [])
      ].sort((a, b) => b.id - a.id);

      setBookings(sortedBookings);

      // =================================================
      // DEBUG COMPLETED BOOKINGS
      // =================================================

      console.log(
        "COMPLETED BOOKINGS:",
        sortedBookings.filter(
          (booking) =>
            booking.status?.toUpperCase() ===
            "COMPLETED"
        )
      );
    } catch (error) {
      console.error(
        "Unable to load bookings:",
        error
      );

      setBookings([]);

      showNotification(
        "error",
        "Unable to Load Bookings",
        "We could not load your booking history."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PAYMENT
  // =====================================================

  const handlePayment = async (booking) => {
    try {
      console.log(
        "Starting payment:",
        booking
      );

      // -------------------------------------------------
      // CREATE RAZORPAY ORDER
      // -------------------------------------------------

      const response =
        await createPaymentOrder(
          booking.id
        );

      const order = response.data;

      console.log(
        "Payment order:",
        order
      );

      // -------------------------------------------------
      // CHECK ORDER
      // -------------------------------------------------

      if (!order) {
        showNotification(
          "warning",
          "Payment Unavailable",
          "Payment order was not created."
        );

        return;
      }

      // -------------------------------------------------
      // CHECK ORDER ID
      // -------------------------------------------------

      if (!order.orderId) {
        showNotification(
          "error",
          "Payment Error",
          "Razorpay Order ID is missing."
        );

        console.error(
          "Invalid order response:",
          order
        );

        return;
      }

      // -------------------------------------------------
      // CHECK KEY
      // -------------------------------------------------

      if (!order.keyId) {
        showNotification(
          "error",
          "Payment Error",
          "Razorpay Key ID is missing."
        );

        console.error(
          "Invalid Razorpay key:",
          order
        );

        return;
      }

      // -------------------------------------------------
      // CHECK RAZORPAY SDK
      // -------------------------------------------------

      if (!window.Razorpay) {
        showNotification(
          "error",
          "Payment Unavailable",
          "Razorpay payment system is not loaded."
        );

        console.error(
          "window.Razorpay is undefined"
        );

        return;
      }

      // =================================================
      // RAZORPAY OPTIONS
      // =================================================

      const options = {
        key: order.keyId,

        amount: order.amount,

        currency:
          order.currency ||
          "INR",

        name: "HiveCare",

        description:
          `Payment for ${booking.service}`,

        order_id:
          order.orderId,

        // ------------------------------------------------
        // CUSTOMER INFORMATION
        // ------------------------------------------------

        prefill: {
          name:
            booking.name ||
            user?.name ||
            "",

          email:
            user?.email ||
            "",

          contact:
            user?.phone ||
            ""
        },

        // ------------------------------------------------
        // THEME
        // ------------------------------------------------

        theme: {
          color: "#198754"
        },

        // =================================================
        // PAYMENT SUCCESS
        // =================================================

        handler: async function (
          razorpayResponse
        ) {
          console.log(
            "Razorpay response:",
            razorpayResponse
          );

          try {
            const paymentData = {
              bookingId:
                booking.id,

              razorpay_order_id:
                razorpayResponse
                  .razorpay_order_id,

              razorpay_payment_id:
                razorpayResponse
                  .razorpay_payment_id,

              razorpay_signature:
                razorpayResponse
                  .razorpay_signature
            };

            console.log(
              "VERIFY PAYMENT DATA:",
              paymentData
            );

            const verifyResponse =
              await verifyPayment(
                paymentData
              );

            console.log(
              "Verify response:",
              verifyResponse.data
            );

            // =================================================
            // PAYMENT VERIFIED
            // =================================================

            if (
              verifyResponse.data?.success ===
              true ||
              verifyResponse.data?.paymentStatus ===
              "PAID"
            ) {
              showNotification(
                "success",
                "Payment Successful",
                `Payment of ₹${booking.amount || 0
                } has been debited successfully.`
              );

              await loadBookings();
            } else {
              showNotification(
                "error",
                "Payment Verification Failed",
                verifyResponse.data?.message ||
                "We could not verify your payment."
              );
            }
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            console.error(
              "Backend error response:",
              error.response?.data
            );

            showNotification(
              "error",
              "Payment Verification Failed",
              error.response?.data?.message ||
              error.response?.data ||
              "Payment verification failed."
            );
          }
        },

        // =================================================
        // MODAL CLOSED
        // =================================================

        modal: {
          ondismiss: function () {
            console.log(
              "Razorpay popup closed"
            );
          }
        }
      };

      // =================================================
      // CREATE RAZORPAY INSTANCE
      // =================================================

      const razorpay =
        new window.Razorpay(options);

      // =================================================
      // PAYMENT FAILED
      // =================================================

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response
          );

          showNotification(
            "error",
            "Payment Failed",
            response.error?.description ||
            "Your payment could not be completed."
          );
        }
      );

      // =================================================
      // OPEN RAZORPAY
      // =================================================

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      showNotification(
        "error",
        "Payment Error",
        error.response?.data?.message ||
        error.response?.data ||
        "Unable to start payment."
      );
    }
  };

  // =====================================================
  // VIEW RECEIPT
  // =====================================================

  const handleViewReceipt = async (
    bookingId
  ) => {
    try {
      const response =
        await getPaymentReceipt(
          bookingId
        );

      setReceipt(response.data);

      setShowReceipt(true);
    } catch (error) {
      console.error(
        "Receipt error:",
        error
      );

      showNotification(
        "error",
        "Receipt Error",
        error.response?.data?.message ||
        error.response?.data ||
        "Unable to load payment receipt."
      );
    }
  };

  // =====================================================
  // DOWNLOAD RECEIPT PDF
  // =====================================================

  const downloadReceiptPDF = () => {
    if (!receipt) {
      return;
    }

    const doc = new jsPDF();

    // =================================================
    // HEADER
    // =================================================

    doc.setFontSize(24);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "HiveCare",
      20,
      25
    );

    doc.setFontSize(11);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "Professional Home Services",
      20,
      33
    );

    // =================================================
    // RECEIPT TITLE
    // =================================================

    doc.setFontSize(18);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "PAYMENT RECEIPT",
      20,
      55
    );

    doc.setLineWidth(0.5);

    doc.line(
      20,
      60,
      190,
      60
    );

    // =================================================
    // RECEIPT DETAILS
    // =================================================

    doc.setFontSize(11);

    doc.setFont(
      "helvetica",
      "normal"
    );

    let y = 75;

    const addRow = (
      label,
      value
    ) => {
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        label,
        20,
        y
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        String(
          value ?? "N/A"
        ),
        80,
        y
      );

      y += 10;
    };

    addRow(
      "Booking ID:",
      receipt.bookingId
    );

    addRow(
      "Customer:",
      receipt.customerName
    );

    addRow(
      "Service:",
      receipt.service
    );

    addRow(
      "Amount:",
      `Rs. ${receipt.amount ?? 0}`
    );

    addRow(
      "Payment Status:",
      receipt.paymentStatus ||
      "PAID"
    );

    addRow(
      "Payment ID:",
      receipt.razorpayPaymentId ||
      "N/A"
    );

    addRow(
      "Paid At:",
      receipt.paidAt ||
      "N/A"
    );

    y += 10;

    doc.line(
      20,
      y,
      190,
      y
    );

    y += 15;

    doc.setFontSize(12);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Thank you for choosing HiveCare!",
      20,
      y
    );

    doc.setFontSize(9);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "This is a computer-generated payment receipt.",
      20,
      y + 10
    );

    doc.save(
      `HiveCare-Receipt-${receipt.bookingId}.pdf`
    );
  };

 // =====================================================
// OPEN CANCEL CONFIRMATION POPUP
// =====================================================

const handleCancelBooking = (bookingId) => {
  if (cancelling !== null) {
    return;
  }

  setCancelBookingId(bookingId);
  setShowCancelPopup(true);
};

// =====================================================
// CLOSE CANCEL CONFIRMATION POPUP
// =====================================================

const closeCancelPopup = () => {
  if (cancelling !== null) {
    return;
  }

  setShowCancelPopup(false);
  setCancelBookingId(null);
};

// =====================================================
// CONFIRM CANCEL BOOKING
// =====================================================

const confirmCancelBooking = async () => {
  if (!cancelBookingId) {
    return;
  }

  try {
    setCancelling(cancelBookingId);

    const response =
      await cancelBooking(
        cancelBookingId
      );

    // =================================================
    // UPDATE UI IMMEDIATELY
    // =================================================

    setBookings(
      (prevBookings) =>
        prevBookings.map(
          (booking) =>
            booking.id === cancelBookingId
              ? {
                  ...booking,
                  status: "CANCELLED"
                }
              : booking
        )
    );

    // Close popup
    setShowCancelPopup(false);
    setCancelBookingId(null);

    // Success notification
    showNotification(
      "success",
      "Booking Cancelled",
      "Your booking has been cancelled successfully."
    );

  } catch (error) {

    showNotification(
      "error",
      "Cancellation Failed",
      error.response?.data?.message ||
      error.response?.data ||
      "Unable to cancel booking."
    );

  } finally {
    setCancelling(null);
  }
};

  // =====================================================
  // EDIT BOOKING
  // =====================================================

  const handleEdit = (
    booking
  ) => {
    setEditingBooking({
      ...booking
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // =====================================================
  // UPDATE BOOKING
  // =====================================================

  const handleUpdate = async () => {
    if (!editingBooking) {
      return;
    }

    try {
      const response =
        await updateBooking(
          editingBooking.id,
          editingBooking
        );

      setBookings(
        bookings.map(
          (booking) =>
            booking.id ===
              editingBooking.id
              ? response.data
              : booking
        )
      );

      setEditingBooking(null);

      showNotification(
        "success",
        "Booking Updated",
        "Your booking information has been updated successfully."
      );
    } catch (error) {
      console.error(
        "Update error:",
        error
      );

      showNotification(
        "error",
        "Update Failed",
        error.response?.data?.message ||
        error.response?.data ||
        "Unable to update your booking."
      );
    }
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const cancelEdit = () => {
    setEditingBooking(null);
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (
    status
  ) => {
    switch (
    status?.toUpperCase()
    ) {
      case "COMPLETED":
        return "history-status completed";

      case "ACCEPTED":
        return "history-status accepted";

      case "REJECTED":
        return "history-status rejected";

      case "CANCELLED":
        return "history-status cancelled";

      case "PENDING":
      default:
        return "history-status pending";
    }
  };

  // =====================================================
  // STATUS ICON
  // =====================================================

  const getStatusIcon = (
    status
  ) => {
    switch (
    status?.toUpperCase()
    ) {
      case "COMPLETED":
        return "bi bi-check-circle-fill";

      case "ACCEPTED":
        return "bi bi-check-circle";

      case "REJECTED":
        return "bi bi-x-circle-fill";

      case "CANCELLED":
        return "bi bi-x-circle-fill";

      case "PENDING":
      default:
        return "bi bi-clock-fill";
    }
  };

  // =====================================================
  // PAYMENT STATUS CLASS
  // =====================================================

  const getPaymentClass = (
    status
  ) => {
    if (
      status === "PAID"
    ) {
      return "payment-status paid";
    }

    return "payment-status pending";
  };

  // =====================================================
  // NO USER
  // =====================================================

  if (!user) {
    return (
      <div className="history-page">
        <div className="container">
          <div className="history-empty">
            <div className="empty-icon">
              <i className="bi bi-person-circle"></i>
            </div>

            <h3>
              Please Login
            </h3>

            <p>
              Login to view your booking history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="history-page">

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification.show && (
        <div
          className={
            `history-notification ${notification.type}`
          }
        >
          <div className="notification-icon">
            <i
              className={
                notification.type ===
                  "success"
                  ? "bi bi-check-circle-fill"
                  : notification.type ===
                    "error"
                    ? "bi bi-x-circle-fill"
                    : notification.type ===
                      "warning"
                      ? "bi bi-exclamation-triangle-fill"
                      : "bi bi-info-circle-fill"
              }
            ></i>
          </div>

          <div className="notification-content">
            <strong>
              {notification.title}
            </strong>

            <p>
              {notification.text}
            </p>
          </div>

          <button
            type="button"
            className="notification-close"
            onClick={
              closeNotification
            }
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      <div className="container py-5">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="history-header">

          <div>
            <span className="history-small-title">
              <i className="bi bi-calendar-check me-2"></i>
              HIVECARE
            </span>

            <h1>
              My Booking History
            </h1>

            <p>
              Track your services, workers and payments
              in one place.
            </p>
          </div>

          <div className="booking-count">

            <div className="count-icon">
              <i className="bi bi-journal-check"></i>
            </div>

            <div>
              <span>
                Total Bookings
              </span>

              <strong>
                {bookings.length}
              </strong>
            </div>

          </div>

        </div>

        {/* =================================================
            EDIT BOOKING
        ================================================= */}

        {editingBooking && (
          <div className="edit-booking-card">

            <div className="edit-header">

              <div>

                <span className="edit-icon">
                  <i className="bi bi-pencil-square"></i>
                </span>

                <div>

                  <h4>
                    Edit Booking
                  </h4>

                  <p>
                    Update your booking information
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="close-edit"
                onClick={
                  cancelEdit
                }
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

            <div className="row">

              {/* NAME */}

              <div className="col-md-4 mb-3">

                <label>
                  Full Name
                </label>

                <div className="input-wrapper">

                  <i className="bi bi-person"></i>

                  <input
                    type="text"
                    value={
                      editingBooking.name ||
                      ""
                    }
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        name:
                          e.target.value
                      })
                    }
                  />

                </div>

              </div>

              {/* ADDRESS */}

              <div className="col-md-4 mb-3">

                <label>
                  Address
                </label>

                <div className="input-wrapper">

                  <i className="bi bi-geo-alt"></i>

                  <input
                    type="text"
                    value={
                      editingBooking.address ||
                      ""
                    }
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        address:
                          e.target.value
                      })
                    }
                  />

                </div>

              </div>

              {/* DATE */}

              <div className="col-md-4 mb-3">

                <label>
                  Service Date
                </label>

                <div className="input-wrapper">

                  <i className="bi bi-calendar3"></i>

                  <input
                    type="date"
                    value={
                      editingBooking.date ||
                      ""
                    }
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        date:
                          e.target.value
                      })
                    }
                  />

                </div>

              </div>
              <div className="col-md-4 mb-3">
                <label>Time Slot</label>

                <div className="input-wrapper">
                  <i className="bi bi-clock"></i>

                  <select
                    value={editingBooking.timeSlot || ""}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        timeSlot: e.target.value
                      })
                    }
                  >
                    <option value="">Select Time Slot</option>

                    <option value="08:00 AM - 10:00 AM">
                      08:00 AM - 10:00 AM
                    </option>

                    <option value="10:00 AM - 12:00 PM">
                      10:00 AM - 12:00 PM
                    </option>

                    <option value="12:00 PM - 02:00 PM">
                      12:00 PM - 02:00 PM
                    </option>

                    <option value="02:00 PM - 04:00 PM">
                      02:00 PM - 04:00 PM
                    </option>

                    <option value="04:00 PM - 06:00 PM">
                      04:00 PM - 06:00 PM
                    </option>

                    <option value="06:00 PM - 08:00 PM">
                      06:00 PM - 08:00 PM
                    </option>
                  </select>
                </div>
              </div>

            </div>

            <div className="edit-actions">

              <button
                type="button"
                className="btn-cancel"
                onClick={
                  cancelEdit
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-save"
                onClick={
                  handleUpdate
                }
              >
                <i className="bi bi-check-lg me-2"></i>
                Save Changes
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="history-loading">

            <div className="spinner-border"></div>

            <p>
              Loading your bookings...
            </p>

          </div>

        ) : bookings.length === 0 ? (

          /* =================================================
             EMPTY STATE
          ================================================= */

          <div className="history-empty">

            <div className="empty-icon">
              <i className="bi bi-calendar-x"></i>
            </div>

            <h3>
              No Bookings Yet
            </h3>

            <p>
              You haven't booked any services yet.
              Your bookings will appear here.
            </p>

          </div>

        ) : (

          /* =================================================
             BOOKING LIST
          ================================================= */

          <div className="history-list">

            {bookings.map(
              (booking) => (

                <div
                  key={booking.id}
                  className="history-card"
                >

                  {/* =================================================
                      CARD TOP
                  ================================================= */}

                  <div className="history-card-top">

                    <div className="service-info">

                      <div className="service-icon">
                        <i className="bi bi-tools"></i>
                      </div>

                      <div>

                        <span>
                          BOOKING #{booking.id}
                        </span>

                        <h3>
                          {booking.service}
                        </h3>

                      </div>

                    </div>

                    <span
                      className={
                        getStatusClass(
                          booking.status
                        )
                      }
                    >

                      <i
                        className={
                          getStatusIcon(
                            booking.status
                          )
                        }
                      ></i>

                      {
                        booking.status ||
                        "PENDING"
                      }

                    </span>

                  </div>

                  {/* =================================================
                      CARD BODY
                  ================================================= */}

                  <div className="history-card-body">

                    {/* CUSTOMER */}

                    <div className="info-box">

                      <div
                        className="info-icon"
                        style={{
                          backgroundColor:
                            "whitesmoke",
                          color:
                            "#106cee",
                          height:
                            "45px",
                          width:
                            "45px"
                        }}
                      >
                        <i
                          className="bi bi-person-fill"
                          style={{
                            marginTop:
                              "5px",
                            fontSize:
                              "20px"
                          }}
                        ></i>
                      </div>

                      <div>

                        <span>
                          Customer
                        </span>

                        <strong>
                          {
                            booking.name ||
                            "N/A"
                          }
                        </strong>

                      </div>

                    </div>

                    {/* ADDRESS */}

                    <div className="info-box">

                      <div
                        className="info-icon"
                        style={{
                          backgroundColor:
                            "whitesmoke",
                          color:
                            "#106cee",
                          height:
                            "45px",
                          width:
                            "45px"
                        }}
                      >
                        <i
                          className="bi bi-geo-alt-fill"
                          style={{
                            marginTop:
                              "5px",
                            fontSize:
                              "20px"
                          }}
                        ></i>
                      </div>

                      <div>

                        <span>
                          Service Address
                        </span>

                        <strong>
                          {
                            booking.address ||
                            "N/A"
                          }
                        </strong>

                      </div>

                    </div>

                    {/* DATE */}

                    <div className="info-box">

                      <div
                        className="info-icon"
                        style={{
                          backgroundColor:
                            "whitesmoke",
                          color:
                            "#106cee",
                          height:
                            "45px",
                          width:
                            "45px"
                        }}
                      >
                        <i
                          className="bi bi-calendar-event-fill"
                          style={{
                            marginTop:
                              "5px",
                            fontSize:
                              "20px"
                          }}
                        ></i>
                      </div>

                      <div>

                        <span>
                          Service Date
                        </span>

                        <strong>
                          {
                            booking.date ||
                            "N/A"
                          }
                        </strong>

                      </div>

                    </div>
                    <div className="info-box">
                      <div
                        className="info-icon"
                        style={{
                          backgroundColor: "whitesmoke",
                          color: "#106cee",
                          height: "45px",
                          width: "45px"
                        }}
                      >
                        <i
                          className="bi bi-clock-fill"
                          style={{
                            marginTop: "5px",
                            fontSize: "20px"
                          }}
                        ></i>
                      </div>

                      <div>
                        <span>Time Slot</span>
                        <strong>
                          {booking.timeSlot || "N/A"}
                        </strong>
                      </div>
                    </div>
                    {/* PRICE */}

                    <div className="info-box price-box">

                      <div
                        className="info-icon"
                        style={{
                          height:
                            "45px",
                          width:
                            "45px"
                        }}
                      >
                        <i
                          className="bi bi-currency-rupee"
                          style={{
                            marginTop:
                              "5px",
                            fontSize:
                              "20px"
                          }}
                        ></i>
                      </div>

                      <div>

                        <span>
                          Amount
                        </span>

                        <strong>
                          ₹{booking.amount || 0}
                        </strong>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      EXTRA INFORMATION
                  ================================================= */}

                  <div className="booking-details">

                    {/* COURSE */}

                    {booking.course && (
                      <div className="detail-item">

                        <i className="bi bi-sliders"></i>

                        <div>

                          <span>
                            Service Type
                          </span>

                          <strong>
                            {
                              booking.course
                            }
                          </strong>

                        </div>

                      </div>
                    )}

                    {/* WORKER */}

                    <div className="detail-item">

                      <i className="bi bi-person-badge-fill"></i>

                      <div>

                        <span>
                          Assigned Worker
                        </span>

                        <strong>
                          {
                            booking.workerName ||
                            "Not Assigned Yet"
                          }
                        </strong>

                      </div>

                    </div>

                    {/* PAYMENT OPTION */}

                    <div className="detail-item">

                      <i className="bi bi-wallet2"></i>

                      <div>

                        <span>
                          Payment Option
                        </span>

                        <strong>

                          {
                            booking.paymentTiming ===
                              "PAY_NOW"

                              ? "Pay Now"

                              : booking.paymentTiming ===
                                "PAY_AFTER_SERVICE"

                                ? "Pay After Service"

                                : "Not Selected"
                          }

                        </strong>

                      </div>

                    </div>

                    {/* PAYMENT STATUS */}

                    <div className="detail-item">

                      <i className="bi bi-credit-card-fill"></i>

                      <div>

                        <span>
                          Payment Status
                        </span>

                        <strong
                          className={
                            getPaymentClass(
                              booking.paymentStatus
                            )
                          }
                        >

                          <i
                            className={
                              booking.paymentStatus ===
                                "PAID"

                                ? "bi bi-check-circle-fill me-1"

                                : "bi bi-clock-fill me-1"
                            }
                          ></i>

                          {
                            booking.paymentStatus ||
                            "PENDING"
                          }

                        </strong>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      PAYMENT ACTION
                  ================================================= */}

                  <div className="payment-section">

                    {/* PAY NOW */}

                    {booking.paymentTiming ===
                      "PAY_NOW" &&
                      booking.paymentStatus !==
                      "PAID" && (

                        <div className="payment-action">

                          <div>

                            <span>
                              Payment Required
                            </span>

                            <strong>
                              ₹{booking.amount}
                            </strong>

                          </div>

                          <button
                            type="button"
                            className="pay-button"
                            onClick={() =>
                              handlePayment(
                                booking
                              )
                            }
                          >

                            <i className="bi bi-credit-card-fill me-2"></i>

                            Pay Now

                          </button>

                        </div>
                      )}

                    {/* PAY AFTER SERVICE */}

                    {booking.paymentTiming ===
                      "PAY_AFTER_SERVICE" &&
                      booking.status?.toUpperCase() ===
                      "COMPLETED" &&
                      booking.paymentStatus !==
                      "PAID" && (

                        <div className="payment-action">

                          <div>

                            <span>
                              Service Completed
                            </span>

                            <strong>
                              ₹{booking.amount}
                            </strong>

                          </div>

                          <button
                            type="button"
                            className="pay-button"
                            onClick={() =>
                              handlePayment(
                                booking
                              )
                            }
                          >

                            <i className="bi bi-credit-card-fill me-2"></i>

                            Pay Now

                          </button>

                        </div>
                      )}

                    {/* WAITING */}

                    {booking.paymentTiming ===
                      "PAY_AFTER_SERVICE" &&
                      booking.status?.toUpperCase() !==
                      "COMPLETED" &&
                      booking.paymentStatus !==
                      "PAID" && (

                        <div className="payment-waiting">

                          <div className="waiting-icon">

                            <i className="bi bi-hourglass-split"></i>

                          </div>

                          <div>

                            <strong>
                              Payment not available yet
                            </strong>

                            <p>
                              Payment will become available
                              after the worker completes
                              your service.
                            </p>

                          </div>

                        </div>
                      )}

                    {/* PAYMENT COMPLETE */}

                    {booking.paymentStatus ===
                      "PAID" && (

                        <div className="payment-success">

                          <div className="success-left">

                            <div className="success-icon">

                              <i className="bi bi-check-lg"></i>

                            </div>

                            <div>

                              <strong>
                                Payment Successful
                              </strong>

                              <span>
                                Your payment has been received.
                              </span>

                            </div>

                          </div>

                          <button
                            className="view-receipt-btn"
                            onClick={() =>
                              handleViewReceipt(
                                booking.id
                              )
                            }
                          >

                            <i className="bi bi-receipt"></i>

                            View Receipt

                          </button>

                        </div>
                      )}

                  </div>

                  {/* =================================================
                      CARD FOOTER
                  ================================================= */}

                  <div className="history-card-footer">

                    <span>

                      <i className="bi bi-clock-history me-1"></i>

                      Booking #{booking.id}

                    </span>

                    <div className="card-actions">

                      {/* =================================================
                          REVIEW BUTTON
                      ================================================= */}

                      {booking.status?.toUpperCase() ===
                        "COMPLETED" && (

                          reviewedBookings[
                            booking.id
                          ] ? (

                            <span className="reviewed-badge">

                              <i className="bi bi-star-fill"></i>

                              REVIEWED

                            </span>

                          ) : (

                            <button
                              type="button"
                              className="review-button"
                              onClick={() =>
                                openReviewModal(
                                  booking
                                )
                              }
                            >

                              <i className="bi bi-star-fill me-1"></i>

                              Review

                            </button>

                          )
                        )}

                      {/* =================================================
                          EDIT
                      ================================================= */}

                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEdit(
                            booking
                          )
                        }
                      >

                        <i className="bi bi-pencil me-1"></i>

                        Edit

                      </button>

                      {/* =================================================
                          CANCEL
                      ================================================= */}

                      {booking.status?.toUpperCase() !==
                        "CANCELLED" &&
                        booking.status?.toUpperCase() !==
                        "COMPLETED" && (

                          <button
                            type="button"
                            className="cancel-booking-btn"
                            onClick={() =>
                              handleCancelBooking(
                                booking.id
                              )
                            }
                            disabled={
                              cancelling ===
                              booking.id
                            }
                          >

                            {cancelling ===
                              booking.id ? (

                              <>
                                <i className="bi bi-hourglass-split"></i>

                                Cancelling...
                              </>

                            ) : (

                              <>
                                <i className="bi bi-x-circle"></i>

                                Cancel Booking
                              </>

                            )}

                          </button>
                        )}

                      {/* =================================================
                          CANCELLED
                      ================================================= */}

                      {booking.status?.toUpperCase() ===
                        "CANCELLED" && (

                          <span className="cancelled-badge">

                            <i className="bi bi-x-circle-fill"></i>

                            CANCELLED

                          </span>
                        )}

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>
        {/* =================================================
    CANCEL CONFIRMATION POPUP
================================================= */}

{showCancelPopup && (

  <div
    className="cancel-confirm-overlay"
    onClick={(e) => {
      if (
        e.target === e.currentTarget &&
        cancelling === null
      ) {
        closeCancelPopup();
      }
    }}
  >

    <div className="cancel-confirm-modal">

      {/* ICON */}

      <div className="cancel-confirm-icon">
        <i className="bi bi-exclamation-triangle-fill"></i>
      </div>

      {/* CONTENT */}

      <div className="cancel-confirm-content">

        <h3>
          Cancel Booking?
        </h3>

        <p>
          Are you sure you want to cancel this booking?
        </p>

        <span>
          The booking will remain in your booking
          history, but its status will become
          <strong> CANCELLED</strong>.
        </span>

      </div>

      {/* ACTIONS */}

      <div className="cancel-confirm-actions">

        <button
          type="button"
          className="cancel-confirm-no"
          onClick={closeCancelPopup}
          disabled={cancelling !== null}
        >
          <i className="bi bi-arrow-left"></i>
          Keep Booking
        </button>

        <button
          type="button"
          className="cancel-confirm-yes"
          onClick={confirmCancelBooking}
          disabled={cancelling !== null}
        >

          {cancelling !== null ? (

            <>
              <span className="spinner-border spinner-border-sm"></span>
              Cancelling...
            </>

          ) : (

            <>
              <i className="bi bi-x-circle-fill"></i>
              Yes, Cancel
            </>

          )}

        </button>

      </div>

    </div>

  </div>

)}
      {/* =================================================
          REVIEW MODAL
      ================================================= */}

      {reviewBooking && (

        <div
          className="review-overlay"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeReviewModal();
            }
          }}
        >

          <div className="review-modal">

            {/* =================================================
                REVIEW HEADER
            ================================================= */}

            <div className="review-modal-header">

              <div className="review-header-left">

                <span className="review-icon">

                  <i className="bi bi-star-fill"></i>

                </span>

                <div>

                  <h3>
                    Rate Your Service
                  </h3>

                  <p>
                    {
                      reviewBooking.service ||
                      "HiveCare Service"
                    }
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="review-close"
                onClick={
                  closeReviewModal
                }
                disabled={
                  reviewLoading
                }
              >

                <i className="bi bi-x-lg"></i>

              </button>

            </div>

            {/* =================================================
                REVIEW BODY
            ================================================= */}

            <div className="review-modal-body">

              <p className="review-question">
                How was your service?
              </p>

              {/* STARS */}

              <div className="review-stars">

                {[1, 2, 3, 4, 5].map(
                  (star) => (

                    <button
                      key={star}
                      type="button"
                      className={
                        star <=
                          reviewRating
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setReviewRating(
                          star
                        )
                      }
                      disabled={
                        reviewLoading
                      }
                      aria-label={
                        `${star} star${star > 1
                          ? "s"
                          : ""
                        }`
                      }
                    >

                      <i className="bi bi-star-fill"></i>

                    </button>
                  )
                )}

              </div>

              {/* RATING TEXT */}

              <p className="review-rating-text">

                {reviewRating ===
                  0
                  ? "Select a rating"
                  : reviewRating ===
                    1
                    ? "1 out of 5 - Poor"
                    : reviewRating ===
                      2
                      ? "2 out of 5 - Fair"
                      : reviewRating ===
                        3
                        ? "3 out of 5 - Good"
                        : reviewRating ===
                          4
                          ? "4 out of 5 - Very Good"
                          : "5 out of 5 - Excellent"}

              </p>

              {/* COMMENT */}

              <textarea
                className="review-comment"
                value={
                  reviewComment
                }
                onChange={(e) =>
                  setReviewComment(
                    e.target.value
                  )
                }
                placeholder="Tell us about your experience (optional)"
                rows="4"
                disabled={
                  reviewLoading
                }
              />

              {/* ACTIONS */}

              <div className="review-modal-actions">

                <button
                  type="button"
                  className="review-cancel-btn"
                  onClick={
                    closeReviewModal
                  }
                  disabled={
                    reviewLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="review-submit-btn"
                  onClick={
                    submitReview
                  }
                  disabled={
                    reviewLoading ||
                    reviewRating < 1
                  }
                >

                  {reviewLoading ? (

                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>

                      Submitting...
                    </>

                  ) : (

                    <>
                      <i className="bi bi-send-fill me-2"></i>

                      Submit Review
                    </>

                  )}

                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          RECEIPT MODAL
      ================================================= */}

      {showReceipt &&
        receipt && (

          <div className="receipt-overlay">

            <div className="receipt-modal">

              {/* HEADER */}

              <div className="receipt-modal-header">

                <div>

                  <div className="receipt-logo">

                    <i className="bi bi-heart-pulse-fill"></i>

                    <span>
                      HiveCare
                    </span>

                  </div>

                  <p>
                    Payment Receipt
                  </p>

                </div>

                <button
                  type="button"
                  className="receipt-close"
                  onClick={() =>
                    setShowReceipt(
                      false
                    )
                  }
                >

                  <i className="bi bi-x-lg"></i>

                </button>

              </div>

              {/* SUCCESS */}

              <div className="receipt-success">

                <div className="receipt-success-icon">

                  <i className="bi bi-check-lg"></i>

                </div>

                <div>

                  <h3>
                    Payment Successful
                  </h3>

                  <p>
                    Your payment has been received.
                  </p>

                </div>

              </div>

              {/* DETAILS */}

              <div className="receipt-details">

                <div className="receipt-row">

                  <span>
                    Booking ID
                  </span>

                  <strong>
                    #{receipt.bookingId}
                  </strong>

                </div>

                <div className="receipt-row">

                  <span>
                    Customer
                  </span>

                  <strong>
                    {
                      receipt.customerName ||
                      "N/A"
                    }
                  </strong>

                </div>

                <div className="receipt-row">

                  <span>
                    Service
                  </span>

                  <strong>
                    {
                      receipt.service ||
                      "N/A"
                    }
                  </strong>

                </div>

                <div className="receipt-row">

                  <span>
                    Amount
                  </span>

                  <strong className="receipt-amount">
                    ₹{receipt.amount ?? 0}
                  </strong>

                </div>

                <div className="receipt-row">

                  <span>
                    Payment Status
                  </span>

                  <strong className="receipt-paid">

                    <i className="bi bi-check-circle-fill"></i>

                    {
                      receipt.paymentStatus ||
                      "PAID"
                    }

                  </strong>

                </div>

                <div className="receipt-row">

                  <span>
                    Razorpay Payment ID
                  </span>

                  <strong>
                    {
                      receipt.razorpayPaymentId ||
                      "N/A"
                    }
                  </strong>

                </div>

                <div className="receipt-row">

                  <span>
                    Paid At
                  </span>

                  <strong>
                    {
                      receipt.paidAt ||
                      "N/A"
                    }
                  </strong>

                </div>

              </div>

              {/* FOOTER */}

              <div className="receipt-modal-footer">

                <button
                  type="button"
                  className="receipt-download-btn"
                  onClick={
                    downloadReceiptPDF
                  }
                >

                  <i className="bi bi-file-earmark-pdf-fill"></i>

                  Download Receipt PDF

                </button>

                <button
                  type="button"
                  className="receipt-close-btn"
                  onClick={() =>
                    setShowReceipt(
                      false
                    )
                  }
                >

                  Close

                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default History;