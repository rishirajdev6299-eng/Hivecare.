import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import logo from "../../assets/images/logo 3.png";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminStats,
  getAdminBookings,
  getAdminServices,
  getAdminWorkers,
  getAdminUsers,
  getAdminReviews,
  deleteReview,
  createAdminWorker,
  searchAdminWorkers,
  getPaymentReceipt,
  deleteAdminBooking,
  blockAdminUser,
  unblockAdminUser,

  updateAdminService,
  getTutorSubjects,
  getServiceOptions,
  createServiceOption,
  updateServiceOption,
  deleteServiceOption,
  createAdminService,
  deleteAdminService

} from "../../api/api";

import "./AdminDashboard.css";


/* =========================================================
   HIVECARE ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {
  useEffect(() => {
    getAdminReviews()
      .then((response) => {
        setReviews(Array.isArray(response?.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("Unable to load admin reviews:", error);
        setReviews([]);
      });
  }, []);

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      showToast("Review deleted successfully.");
    } catch (error) {
      console.error("Unable to delete review:", error);
      showToast(error?.response?.data || "Unable to delete review.", "error");
    }
  };



  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
    logout: authLogout
  } = useAuth();
  /* =========================================================
     MAIN DATA
  ========================================================= */
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceOptions, setServiceOptions] = useState({});
  const [workers, setWorkers] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [adminMenuOpen, setAdminMenuOpen] =
    useState(false);
  /* =========================================================
     FILTERS
  ========================================================= */

  const [bookingSearch, setBookingSearch] =
    useState("");

  const [bookingFilter, setBookingFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [paymentFilter, setPaymentFilter] =
    useState("ALL");

  const [selectedDate, setSelectedDate] =
    useState("");


  const [workerSearch, setWorkerSearch] =
    useState("");

  const [userSearch, setUserSearch] =
    useState("");

  const [paymentSearch, setPaymentSearch] =
    useState("");

  const [analyticsYear, setAnalyticsYear] =
    useState(String(new Date().getFullYear()));

  const [analyticsMonth, setAnalyticsMonth] =
    useState("ALL");

  const [reportCsvOpen, setReportCsvOpen] =
    useState(false);

  const [reportYear, setReportYear] =
    useState(String(new Date().getFullYear()));

  const [reportMonth, setReportMonth] =
    useState("ALL");

  /* =========================================================
     MODALS
  ========================================================= */

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [bookingDetailsModal, setBookingDetailsModal] =
    useState(false);

  const [assignmentBooking, setAssignmentBooking] =
    useState(null);

  const [assignmentWorker, setAssignmentWorker] =
    useState("");

  const [deleteModal, setDeleteModal] =
    useState(false);

  const [selectedBookingId, setSelectedBookingId] =
    useState(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [receiptModal, setReceiptModal] =
    useState(false);

  const [receipt, setReceipt] =
    useState(null);

  const [receiptLoading, setReceiptLoading] =
    useState(false);

  const [createWorkerModal, setCreateWorkerModal] =
    useState(false);

  const [createServiceModal, setCreateServiceModal] =
    useState(false);

  const [editServiceModal, setEditServiceModal] =
    useState(false);

  const [editingService, setEditingService] =
    useState(null);

  const [serviceEditLoading, setServiceEditLoading] =
    useState(false);
  const [deleteServiceTarget, setDeleteServiceTarget] = useState(null);
  /* =========================================================
     LOADING STATES
  ========================================================= */

  const [userActionLoading, setUserActionLoading] =
    useState(null);

  const [workerActionLoading, setWorkerActionLoading] =
    useState(null);

  const [workerCreateLoading, setWorkerCreateLoading] =
    useState(false);

  const [serviceCreateLoading, setServiceCreateLoading] =
    useState(false);

  const [serviceDeleteLoading, setServiceDeleteLoading] =
    useState(null);

  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  /* =========================================================
     FORMS
  ========================================================= */

  const [newWorker, setNewWorker] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    workerService: ""
  });

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    serviceType: ""
  });


  /* =========================================================
     OTHER ADMIN FEATURES
  ========================================================= */

  const [toast, setToast] =
    useState(null);

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [customerDetailsModal, setCustomerDetailsModal] =
    useState(false);

  const [selectedWorker, setSelectedWorker] =
    useState(null);

  const [workerDetailsModal, setWorkerDetailsModal] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [notificationRead, setNotificationRead] =
    useState([]);

  const [settings, setSettings] = useState(() => {

    try {

      return JSON.parse(
        localStorage.getItem(
          "hivecare_admin_settings"
        )
      ) || {
        autoRefresh: false,
        showNotifications: true,
        compactMode: false
      };

    } catch {

      return {
        autoRefresh: false,
        showNotifications: true,
        compactMode: false
      };

    }

  });


  useEffect(() => {

    const loadReviews = async () => {

      try {

        const response =
          await getAdminReviews();

        const data =
          Array.isArray(response?.data)
            ? response.data
            : [];

        setReviews(data);

      } catch (error) {

        console.error(
          "Unable to load admin reviews:",
          error
        );

        setReviews([]);
      }

    };

    loadReviews();

  }, []);

  /* =========================================================
    AUTH
 ========================================================= */

  useEffect(() => {

    // Wait until AuthContext finishes
    // loading the user from the backend.
    if (authLoading) {
      return;
    }

    // No authenticated user.
    if (!user) {

      navigate("/login", {
        replace: true
      });

      return;
    }

    // Role comes from AuthContext/backend.
    const role = String(
      user.role || ""
    )
      .trim()
      .toUpperCase();

    // Only ADMIN can stay on this page.
    if (role !== "ADMIN") {

      navigate("/", {
        replace: true
      });

      return;
    }

    // User is a valid ADMIN.
    loadData();

  }, [
    user,
    authLoading,
    navigate
  ]);

  /* =========================================================
     TOAST
  ========================================================= */

  const showToast = (
    message,
    type = "success"
  ) => {

    setToast({
      message,
      type
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);

  };

  const getBookingDateObject = booking => {
    const value =
      booking?.scheduledAt ||
      booking?.date;

    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  };

  const availableYears = useMemo(() => {
    const years = new Set();

    bookings.forEach(booking => {
      const date = getBookingDateObject(booking);

      if (date) {
        years.add(String(date.getFullYear()));
      }
    });

    years.add(String(new Date().getFullYear()));

    return Array.from(years).sort(
      (a, b) => Number(b) - Number(a)
    );
  }, [bookings]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const getRevenueForMonth = (year, monthIndex) => {
    return bookings
      .filter(booking => {
        const date = getBookingDateObject(booking);

        if (!date) return false;

        return (
          date.getFullYear() === Number(year) &&
          date.getMonth() === monthIndex &&
          String(booking?.paymentStatus || "").toUpperCase() === "PAID"
        );
      })
      .reduce(
        (sum, booking) =>
          sum + Number(booking?.amount || 0),
        0
      );
  };

  const getBookingsForMonth = (year, monthIndex) => {
    return bookings.filter(booking => {
      const date = getBookingDateObject(booking);

      if (!date) return false;

      return (
        date.getFullYear() === Number(year) &&
        date.getMonth() === monthIndex
      );
    });
  };

  const analyticsYearBookings = useMemo(() => {
    return bookings.filter(booking => {
      const date = getBookingDateObject(booking);

      return (
        date &&
        date.getFullYear() === Number(analyticsYear)
      );
    });
  }, [bookings, analyticsYear]);

  const analyticsYearCollected = useMemo(() => {
    return analyticsYearBookings
      .filter(
        booking =>
          String(
            booking?.paymentStatus || ""
          ).toUpperCase() === "PAID"
      )
      .reduce(
        (sum, booking) =>
          sum + Number(booking?.amount || 0),
        0
      );
  }, [analyticsYearBookings]);

  const analyticsYearOutstanding = useMemo(() => {
    return analyticsYearBookings
      .filter(
        booking =>
          String(
            booking?.paymentStatus || ""
          ).toUpperCase() !== "PAID"
      )
      .reduce(
        (sum, booking) =>
          sum + Number(booking?.amount || 0),
        0
      );
  }, [analyticsYearBookings]);

  const analyticsCollected = useMemo(() => {
    if (analyticsMonth === "ALL") {
      return analyticsYearCollected;
    }

    return getRevenueForMonth(
      analyticsYear,
      Number(analyticsMonth)
    );
  }, [
    analyticsYear,
    analyticsMonth,
    analyticsYearCollected,
    bookings
  ]);

  const analyticsRows = useMemo(() => {
    return monthNames.map((month, index) => {
      const monthBookings =
        getBookingsForMonth(
          analyticsYear,
          index
        );

      const collected =
        getRevenueForMonth(
          analyticsYear,
          index
        );

      const outstanding =
        monthBookings
          .filter(
            booking =>
              String(
                booking?.paymentStatus || ""
              ).toUpperCase() !== "PAID"
          )
          .reduce(
            (sum, booking) =>
              sum + Number(booking?.amount || 0),
            0
          );

      return {
        month,
        bookings: monthBookings.length,
        collected,
        outstanding
      };
    });
  }, [analyticsYear, bookings]);

  const AnalyticsBox = ({ title, value }) => {
    return (
      <div
        className="analytics-box"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "110px",
          padding: "18px 20px",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            display: "block",
            width: "100%",
            marginBottom: "8px",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: "700",
            lineHeight: "1.4",
            visibility: "visible",
            opacity: 1
          }}
        >
          {title}
        </div>

        <strong
          style={{
            display: "block",
            width: "100%",
            color: "#172b4d",
            fontSize: "24px",
            fontWeight: "800",
            lineHeight: "1.3",
            visibility: "visible",
            opacity: 1
          }}
        >
          {value}
        </strong>
      </div>
    );
  };

  /* =========================================================
   SERVICE OPTION PRICE
   Tutor / Beautician / House Cleaning / Appliance Repair
========================================================= */

  const isOptionService = (serviceName) => {
    const name =
      String(serviceName || "")
        .trim()
        .toLowerCase();

    return (
      name === "tutor" ||
      name === "beautician" ||
      name === "house cleaning" ||
      name === "appliance repair"
    );
  };


  const getMinimumOptionPrice = (serviceName) => {
    const options =
      serviceOptions[serviceName] || [];

    const prices = options
      .map(option => Number(option?.price))
      .filter(
        price =>
          Number.isFinite(price) &&
          price > 0
      );

    if (!prices.length) {
      return null;
    }

    return Math.min(...prices);
  };


  const getDisplayServicePrice = (service) => {
    if (!service) {
      return 0;
    }

    /*
     * For Tutor / Beautician / House Cleaning /
     * Appliance Repair:
     *
     * use the cheapest subject/option price.
     */
    if (isOptionService(service.name)) {

      const minimumPrice =
        getMinimumOptionPrice(service.name);

      if (minimumPrice !== null) {
        return minimumPrice;
      }
    }

    /*
     * Normal services use their own service price.
     */
    if (
      service.price !== null &&
      service.price !== undefined &&
      service.price !== ""
    ) {
      return Number(service.price) || 0;
    }

    if (
      service.amount !== null &&
      service.amount !== undefined &&
      service.amount !== ""
    ) {
      return Number(service.amount) || 0;
    }

    return 0;
  };
  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = async () => {

    try {

      setLoading(true);

      const [
        statsRes,
        bookingsRes,
        servicesRes,
        workersRes,
        usersRes
      ] = await Promise.all([

        getAdminStats(),
        getAdminBookings(),
        getAdminServices(),
        getAdminWorkers(),
        getAdminUsers()

      ]);

      setStats(
        statsRes?.data || {}
      );

      setBookings(
        Array.isArray(bookingsRes?.data)
          ? bookingsRes.data
          : []
      );

      const loadedServices =
        Array.isArray(servicesRes?.data)
          ? servicesRes.data
          : [];

      setServices(loadedServices);


      /* =====================================================
         LOAD OPTION PRICES
      ===================================================== */

      const optionData = {};

      for (const service of loadedServices) {

        if (!isOptionService(service?.name)) {
          continue;
        }

        try {

          const optionResponse =
            await getServiceOptions(service.name);

          optionData[service.name] =
            Array.isArray(optionResponse?.data)
              ? optionResponse.data
              : [];

        } catch (error) {

          console.error(
            `Unable to load options for ${service.name}:`,
            error
          );

          optionData[service.name] = [];
        }
      }

      setServiceOptions(optionData);

      setWorkers(
        Array.isArray(workersRes?.data)
          ? workersRes.data
          : []
      );

      setUsers(
        Array.isArray(usersRes?.data)
          ? usersRes.data
          : []
      );

    } catch (error) {

      console.error(
        "Admin dashboard error:",
        error
      );

      showToast(
        error.response?.data ||
        "Unable to load admin dashboard.",
        "error"
      );

    } finally {

      setLoading(false);

    }

  };

  // =====================================================
  // UPDATE EDITED OPTION IN STATE
  // =====================================================

  const handleEditOptionChange = (
    index,
    field,
    value
  ) => {

    setEditingService(previous => {

      const options = [
        ...(previous.options || [])
      ];

      options[index] = {
        ...options[index],
        [field]: value
      };

      return {
        ...previous,
        options
      };
    });
  };


  // =====================================================
  // REMOVE EXISTING OPTION FROM EDIT STATE
  // =====================================================

  const handleRemoveOption = (index) => {

    setEditingService(previous => {

      const options = [
        ...(previous.options || [])
      ];

      options.splice(index, 1);

      return {
        ...previous,
        options
      };
    });
  };


  // =====================================================
  // ADD NEW EMPTY OPTION
  // =====================================================

  const handleAddOption = () => {

    setEditingService(previous => ({
      ...previous,

      newOptions: [
        ...(previous.newOptions || []),
        {
          name: "",
          price: ""
        }
      ]
    }));
  };


  // =====================================================
  // UPDATE NEW OPTION
  // =====================================================

  const handleNewOptionChange = (
    index,
    field,
    value
  ) => {

    setEditingService(previous => {

      const newOptions = [
        ...(previous.newOptions || [])
      ];

      newOptions[index] = {
        ...newOptions[index],
        [field]: value
      };

      return {
        ...previous,
        newOptions
      };
    });
  };


  // =====================================================
  // REMOVE NEW OPTION
  // =====================================================

  const handleRemoveNewOption = (index) => {

    setEditingService(previous => {

      const newOptions = [
        ...(previous.newOptions || [])
      ];

      newOptions.splice(index, 1);

      return {
        ...previous,
        newOptions
      };
    });
  };

  const handleUpdateService = async (event) => {

    event.preventDefault();

    if (!editingService?.id) {
      return;
    }

    setServiceEditLoading(true);

    try {

      // =====================================================
      // 1. UPDATE MAIN SERVICE
      // =====================================================

      const payload = {
        name:
          editingService.name.trim(),

        description:
          editingService.description
            ? editingService.description.trim()
            : "",

        price:
          Number(editingService.price || 0)
      };

      const serviceResponse =
        await updateAdminService(
          editingService.id,
          payload
        );

      // =====================================================
      // 2. UPDATE EXISTING OPTIONS
      // =====================================================

      const existingOptions =
        editingService.options || [];

      for (const option of existingOptions) {

        if (!option.id) {
          continue;
        }

        const optionName =
          option.name?.trim();

        if (!optionName) {
          continue;
        }

        await updateServiceOption(
          option.id,
          {
            name: optionName,
            price: Number(option.price || 0),
            serviceId: editingService.id
          }
        );
      }

      // =====================================================
      // 3. CREATE NEW OPTIONS
      // =====================================================

      const newOptions =
        editingService.newOptions || [];

      for (const option of newOptions) {

        const optionName =
          option.name?.trim();

        if (!optionName) {
          continue;
        }

        await createServiceOption({
          name: optionName,
          price: Number(option.price || 0),
          serviceId: editingService.id
        });
      }

      // =====================================================
      // 4. DELETE REMOVED EXISTING OPTIONS
      // =====================================================

      /*
       * We need to know which original options existed
       * before editing.
       *
       * This section is handled by comparing the original
       * option IDs with the current option IDs.
       */

      const originalOptionIds =
        editingService.originalOptions
          ?.map(option => option.id)
          .filter(Boolean) || [];

      const currentOptionIds =
        existingOptions
          .map(option => option.id)
          .filter(Boolean);

      const removedOptionIds =
        originalOptionIds.filter(
          id =>
            !currentOptionIds.includes(id)
        );

      for (const optionId of removedOptionIds) {

        await deleteServiceOption(
          optionId
        );
      }

      // =====================================================
      // 5. UPDATE SERVICE LIST
      // =====================================================

      setServices(previous =>
        previous.map(service =>
          service.id === editingService.id
            ? {
              ...service,
              ...(serviceResponse?.data || {}),
              ...payload
            }
            : service
        )
      );

      // =====================================================
      // 6. CLOSE MODAL
      // =====================================================

      setEditServiceModal(false);

      setEditingService(null);

      showToast(
        "Service and service options updated successfully."
      );

    } catch (error) {

      console.error(
        "Unable to update service:",
        error
      );

      showToast(
        error?.response?.data ||
        "Unable to update service.",
        "error"
      );

    } finally {

      setServiceEditLoading(false);
    }
  };
  /* =========================================================
     REFRESH
  ========================================================= */

  const refreshDashboard = async () => {

    try {

      setRefreshing(true);

      await loadData();

      showToast(
        "Dashboard refreshed successfully."
      );

    } finally {

      setRefreshing(false);

    }

  };


  /* =========================================================
     AUTO REFRESH
  ========================================================= */

  useEffect(() => {

    if (!settings.autoRefresh) {
      return;
    }

    const timer =
      setInterval(() => {
        loadData();
      }, 30000);

    return () =>
      clearInterval(timer);

  }, [settings.autoRefresh]);


  /* =========================================================
     DATE HELPERS
  ========================================================= */

  const getLocalDateString = (
    date = new Date()
  ) => {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return (
      year +
      "-" +
      month +
      "-" +
      day
    );

  };


  const today = () =>
    getLocalDateString(
      new Date()
    );


  const tomorrow = () => {

    const date = new Date();

    date.setDate(
      date.getDate() + 1
    );

    return getLocalDateString(
      date
    );

  };


  const formatDate = value => {

    if (!value) {
      return "N/A";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(value)
        .split("T")[0];

    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  };


  const getDateValue = booking => {

    const value =
      booking?.scheduledAt ||
      booking?.date;

    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {

      return getLocalDateString(
        date
      );

    }

    return String(value)
      .substring(0, 10);

  };


  /* =========================================================
     STATUS
  ========================================================= */

  const getStatus = booking =>
    String(
      booking?.status ||
      "PENDING"
    ).toUpperCase();


  const getPaymentStatus = booking =>
    String(
      booking?.paymentStatus ||
      "PENDING"
    ).toUpperCase();


  /* =========================================================
     WORKER
  ========================================================= */

  const getBookingWorkerId =
    booking => {

      if (booking?.workerId) {
        return booking.workerId;
      }

      if (booking?.worker?.id) {
        return booking.worker.id;
      }

      return null;

    };


  const getWorkerName =
    booking => {

      if (booking?.workerName) {
        return booking.workerName;
      }

      if (booking?.worker?.name) {
        return booking.worker.name;
      }

      const workerId =
        getBookingWorkerId(
          booking
        );

      if (workerId) {

        const worker =
          workers.find(
            item =>
              String(item.id) ===
              String(workerId)
          );

        if (worker) {
          return worker.name;
        }

      }

      return "Waiting for worker";

    };


  const getWorkerStats =
    worker => {

      const workerBookings =
        bookings.filter(
          booking =>
            String(
              getBookingWorkerId(
                booking
              )
            ) ===
            String(worker.id)
        );

      const completed =
        workerBookings.filter(
          booking =>
            getStatus(booking) ===
            "COMPLETED"
        ).length;

      const pending =
        workerBookings.filter(
          booking =>
            getStatus(booking) ===
            "PENDING" ||
            getStatus(booking) ===
            "ACCEPTED"
        ).length;

      const rejected =
        workerBookings.filter(
          booking =>
            getStatus(booking) ===
            "REJECTED" ||
            getStatus(booking) ===
            "REJECT"
        ).length;

      return {
        total:
          workerBookings.length,
        completed,
        pending,
        rejected
      };

    };


  /* =========================================================
     SERVICE ICON
  ========================================================= */

  const getServiceIcon =
    service => {

      const name =
        String(service || "")
          .toLowerCase();

      if (
        name.includes("electric")
      ) {
        return "bi bi-lightning-charge-fill";
      }

      if (
        name.includes("plumb")
      ) {
        return "bi bi-droplet-fill";
      }

      if (
        name.includes("clean") ||
        name.includes("maid")
      ) {
        return "bi bi-house-heart-fill";
      }

      if (
        name.includes("baby")
      ) {
        return "bi bi-balloon-heart-fill";
      }

      if (
        name.includes("pet")
      ) {
        return "bi bi-heart-fill";
      }

      if (
        name.includes("yoga")
      ) {
        return "bi bi-person-arms-up";
      }

      if (
        name.includes("carpenter")
      ) {
        return "bi bi-hammer";
      }

      if (
        name.includes("gym")
      ) {
        return "bi bi-activity";
      }

      if (
        name.includes("beaut")
      ) {
        return "bi bi-scissors";
      }

      if (
        name.includes("tutor")
      ) {
        return "bi bi-mortarboard-fill";
      }

      return "bi bi-tools";

    };


  const filteredBookings =
    useMemo(() => {

      let result = [
        ...bookings
      ];

      /* =========================
         SEARCH FILTER
      ========================= */

      if (
        bookingSearch.trim()
      ) {

        const search =
          bookingSearch
            .trim()
            .toLowerCase();

        result =
          result.filter(
            booking => {

              const id =
                String(
                  booking?.id || ""
                ).toLowerCase();

              const customer =
                String(
                  booking?.name || ""
                ).toLowerCase();

              const service =
                String(
                  booking?.service || ""
                ).toLowerCase();

              const worker =
                getWorkerName(
                  booking
                ).toLowerCase();

              return (
                id.includes(search) ||
                customer.includes(search) ||
                service.includes(search) ||
                worker.includes(search)
              );

            }
          );

      }


      /* =========================
         DATE FILTER
      ========================= */

      if (
        bookingFilter ===
        "TODAY"
      ) {

        result =
          result.filter(
            booking =>
              getDateValue(
                booking
              ) === today()
          );

      }


      if (
        bookingFilter ===
        "TOMORROW"
      ) {

        result =
          result.filter(
            booking =>
              getDateValue(
                booking
              ) === tomorrow()
          );

      }


      if (
        bookingFilter ===
        "UPCOMING"
      ) {

        const current =
          today();

        result =
          result.filter(
            booking => {

              const date =
                getDateValue(
                  booking
                );

              return (
                date &&
                date >= current
              );

            }
          );

      }


      if (
        bookingFilter ===
        "PAST"
      ) {

        const current =
          today();

        result =
          result.filter(
            booking => {

              const date =
                getDateValue(
                  booking
                );

              return (
                date &&
                date < current
              );

            }
          );

      }


      if (
        bookingFilter ===
        "CUSTOM" &&
        selectedDate
      ) {

        result =
          result.filter(
            booking =>
              getDateValue(
                booking
              ) === selectedDate
          );

      }


      /* =========================
         MONTH FILTER
      ========================= */

      if (
        selectedMonth !==
        "ALL"
      ) {

        result =
          result.filter(
            booking => {

              const date =
                getBookingDateObject(
                  booking
                );

              if (!date) {
                return false;
              }

              return (
                date.getMonth() ===
                Number(
                  selectedMonth
                )
              );

            }
          );

      }


      /* =========================
         YEAR FILTER
      ========================= */

      if (
        selectedYear !==
        "ALL"
      ) {

        result =
          result.filter(
            booking => {

              const date =
                getBookingDateObject(
                  booking
                );

              if (!date) {
                return false;
              }

              return (
                date.getFullYear() ===
                Number(
                  selectedYear
                )
              );

            }
          );

      }


      /* =========================
         STATUS FILTER
      ========================= */

      if (
        statusFilter !==
        "ALL"
      ) {

        result =
          result.filter(
            booking =>
              getStatus(
                booking
              ) === statusFilter
          );

      }


      /* =========================
         PAYMENT FILTER
      ========================= */

      if (
        paymentFilter !==
        "ALL"
      ) {

        result =
          result.filter(
            booking =>
              getPaymentStatus(
                booking
              ) === paymentFilter
          );

      }


      return result;

    }, [
      bookings,
      bookingSearch,
      bookingFilter,
      statusFilter,
      paymentFilter,
      selectedDate,

      // NEW
      selectedMonth,
      selectedYear,

      workers
    ]);


  /* =========================
     CLEAR ALL FILTERS
  ========================= */

  const clearFilters = () => {

    setBookingSearch("");

    setBookingFilter(
      "ALL"
    );

    setStatusFilter(
      "ALL"
    );

    setPaymentFilter(
      "ALL"
    );

    setSelectedDate("");

    // NEW
    setSelectedMonth(
      "ALL"
    );

    setSelectedYear(
      "ALL"
    );

  };




  const openBookingFilter =
    status => {

      setActiveSection(
        "bookings"
      );

      setBookingSearch("");
      setBookingFilter("ALL");
      setPaymentFilter("ALL");
      setSelectedDate("");

      setStatusFilter(
        status === "ALL"
          ? "ALL"
          : status
      );

    };


  /* =========================================================
     BOOKING DETAILS
  ========================================================= */

  const openBookingDetails =
    booking => {

      setSelectedBooking(
        booking
      );

      setBookingDetailsModal(
        true
      );

    };


  const closeBookingDetails =
    () => {

      setSelectedBooking(null);

      setBookingDetailsModal(
        false
      );

    };


  /* =========================================================
     WORKER ASSIGNMENT
  ========================================================= */

  const openAssignment =
    booking => {

      setAssignmentBooking(
        booking
      );

      setAssignmentWorker(
        getBookingWorkerId(
          booking
        ) || ""
      );

    };


  const closeAssignment =
    () => {

      setAssignmentBooking(
        null
      );

      setAssignmentWorker(
        ""
      );

    };


  const handleLocalAssignment =
    () => {

      if (
        !assignmentBooking ||
        !assignmentWorker
      ) {

        showToast(
          "Please select a worker.",
          "error"
        );

        return;

      }

      const worker =
        workers.find(
          item =>
            String(item.id) ===
            String(
              assignmentWorker
            )
        );

      if (!worker) {
        return;
      }

      /*
       * IMPORTANT:
       * This updates the current admin
       * dashboard state.
       *
       * Permanent database assignment
       * requires an admin assignment API.
       */

      setBookings(
        previous =>
          previous.map(
            booking =>
              String(booking.id) ===
                String(
                  assignmentBooking.id
                )
                ? {
                  ...booking,
                  workerId:
                    worker.id,
                  workerName:
                    worker.name,
                  worker: worker
                }
                : booking
          )
      );

      showToast(
        `${worker.name} assigned to booking #${assignmentBooking.id}.`
      );

      closeAssignment();

    };


  /* =========================================================
     PAYMENT
  ========================================================= */

  const paidBookings =
    bookings.filter(
      booking =>
        getPaymentStatus(
          booking
        ) === "PAID"
    );

  const pendingPayments =
    bookings.filter(
      booking =>
        getPaymentStatus(
          booking
        ) !== "PAID"
    );

  const totalRevenue =
    paidBookings.reduce(
      (sum, booking) =>
        sum +
        Number(
          booking.amount || 0
        ),
      0
    );

  const pendingRevenue =
    pendingPayments.reduce(
      (sum, booking) =>
        sum +
        Number(
          booking.amount || 0
        ),
      0
    );


  const paymentBookings =
    useMemo(() => {

      const search =
        paymentSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return bookings;
      }

      return bookings.filter(
        booking =>
          String(
            booking.id || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            booking.name || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            booking.service || ""
          )
            .toLowerCase()
            .includes(search)

      );

    }, [
      bookings,
      paymentSearch
    ]);


  /* =========================================================
     RECEIPT
  ========================================================= */

  const viewReceipt =
    async bookingId => {

      try {

        setReceiptLoading(
          true
        );

        setReceiptModal(
          true
        );

        const response =
          await getPaymentReceipt(
            bookingId
          );

        setReceipt(
          response.data
        );

      } catch (error) {

        console.error(error);

        setReceipt(null);

        setReceiptModal(
          false
        );

        showToast(
          error.response?.data ||
          "Unable to load payment receipt.",
          "error"
        );

      } finally {

        setReceiptLoading(
          false
        );

      }

    };


  const closeReceipt =
    () => {

      setReceiptModal(false);
      setReceipt(null);

    };


  /* =========================================================
     RECEIPT PDF
  ========================================================= */

  const downloadReceiptPDF =
    async bookingId => {

      try {

        let data =
          receipt;

        if (
          !data ||
          String(
            data.bookingId
          ) !==
          String(bookingId)
        ) {

          const response =
            await getPaymentReceipt(
              bookingId
            );

          data =
            response.data;

        }


        const pdf =
          new jsPDF();

        pdf.setFillColor(
          20,
          91,
          255
        );

        pdf.rect(
          0,
          0,
          210,
          42,
          "F"
        );

        pdf.setTextColor(
          255,
          255,
          255
        );

        pdf.setFontSize(
          23
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.text(
          "HIVECARE",
          20,
          20
        );

        pdf.setFontSize(
          10
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.text(
          "Service Booking & Payment Receipt",
          20,
          30
        );

        pdf.setTextColor(
          30,
          30,
          30
        );

        pdf.setFontSize(
          17
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.text(
          "PAYMENT RECEIPT",
          20,
          62
        );

        let y = 82;

        const row =
          (label, value) => {

            pdf.setFont(
              "helvetica",
              "bold"
            );

            pdf.text(
              label + ":",
              20,
              y
            );

            pdf.setFont(
              "helvetica",
              "normal"
            );

            pdf.text(
              String(
                value ??
                "N/A"
              ),
              75,
              y
            );

            y += 12;

          };


        row(
          "Booking ID",
          data.bookingId ??
          bookingId
        );

        row(
          "Customer",
          data.customerName
        );

        row(
          "Service",
          data.service
        );

        row(
          "Amount",
          "Rs. " +
          (data.amount ?? 0)
        );

        row(
          "Payment Status",
          data.paymentStatus ||
          "PAID"
        );

        row(
          "Payment ID",
          data.razorpayPaymentId ||
          "N/A"
        );

        row(
          "Paid At",
          data.paidAt ||
          "N/A"
        );

        pdf.line(
          20,
          y + 3,
          190,
          y + 3
        );

        pdf.setFontSize(
          10
        );

        pdf.text(
          "Thank you for using HiveCare.",
          20,
          y + 18
        );

        pdf.text(
          "This is a computer generated receipt.",
          20,
          y + 27
        );

        pdf.save(
          "HiveCare_Receipt_" +
          bookingId +
          ".pdf"
        );

        showToast(
          "Receipt PDF downloaded."
        );

      } catch (error) {

        console.error(error);

        showToast(
          "Unable to generate receipt PDF.",
          "error"
        );

      }

    };


  /* =========================================================
     DELETE BOOKING
  ========================================================= */

  const openDeleteModal =
    id => {

      setSelectedBookingId(
        id
      );

      setDeleteModal(
        true
      );

    };


  const closeDeleteModal =
    () => {

      if (
        !deleteLoading
      ) {

        setDeleteModal(
          false
        );

        setSelectedBookingId(
          null
        );

      }

    };


  const handleDeleteBooking =
    async () => {

      if (
        !selectedBookingId
      ) {
        return;
      }

      try {

        setDeleteLoading(
          true
        );

        await deleteAdminBooking(
          selectedBookingId
        );

        setBookings(
          previous =>
            previous.filter(
              booking =>
                String(
                  booking.id
                ) !==
                String(
                  selectedBookingId
                )
            )
        );

        setDeleteModal(
          false
        );

        setSelectedBookingId(
          null
        );

        showToast(
          "Booking deleted successfully."
        );

      } catch (error) {

        console.error(error);

        showToast(
          error.response?.data ||
          "Unable to delete booking.",
          "error"
        );

      } finally {

        setDeleteLoading(
          false
        );

      }

    };


  /* =========================================================
     USER BLOCK / UNBLOCK
  ========================================================= */

  const handleUserBlockToggle =
    async customer => {

      if (!customer?.id) {

        showToast(
          "Invalid user.",
          "error"
        );

        return;

      }

      const blocked =
        Boolean(
          customer.blocked
        );

      try {

        setUserActionLoading(
          customer.id
        );

        if (blocked) {

          await unblockAdminUser(
            customer.id
          );

          setUsers(
            previous =>
              previous.map(
                item =>
                  String(
                    item.id
                  ) ===
                    String(
                      customer.id
                    )
                    ? {
                      ...item,
                      blocked:
                        false
                    }
                    : item
              )
          );

          showToast(
            `${customer.name || "User"} has been unblocked.`
          );

        } else {

          await blockAdminUser(
            customer.id
          );

          setUsers(
            previous =>
              previous.map(
                item =>
                  String(
                    item.id
                  ) ===
                    String(
                      customer.id
                    )
                    ? {
                      ...item,
                      blocked:
                        true
                    }
                    : item
              )
          );

          showToast(
            `${customer.name || "User"} has been blocked.`
          );

        }

      } catch (error) {

        console.error(error);

        showToast(
          error.response?.data ||
          "Unable to update user status.",
          "error"
        );

      } finally {

        setUserActionLoading(
          null
        );

      }

    };


  /* =========================================================
     WORKER BLOCK / UNBLOCK
  ========================================================= */

  const handleWorkerBlockToggle =
    async worker => {

      if (!worker?.id) {

        showToast(
          "Invalid worker.",
          "error"
        );

        return;

      }

      const blocked =
        Boolean(
          worker.blocked
        );

      try {

        setWorkerActionLoading(
          worker.id
        );

        if (blocked) {

          await unblockAdminUser(
            worker.id
          );

          setWorkers(
            previous =>
              previous.map(
                item =>
                  String(
                    item.id
                  ) ===
                    String(
                      worker.id
                    )
                    ? {
                      ...item,
                      blocked:
                        false
                    }
                    : item
              )
          );

          showToast(
            `${worker.name || "Worker"} has been unblocked.`
          );

        } else {

          await blockAdminUser(
            worker.id
          );

          setWorkers(
            previous =>
              previous.map(
                item =>
                  String(
                    item.id
                  ) ===
                    String(
                      worker.id
                    )
                    ? {
                      ...item,
                      blocked:
                        true
                    }
                    : item
              )
          );

          showToast(
            `${worker.name || "Worker"} has been blocked.`
          );

        }

      } catch (error) {

        console.error(error);

        showToast(
          error.response?.data ||
          "Unable to update worker status.",
          "error"
        );

      } finally {

        setWorkerActionLoading(
          null
        );

      }

    };


  /* =========================================================
     CREATE WORKER
  ========================================================= */

  const handleCreateWorker =
    async event => {

      event.preventDefault();

      if (
        !newWorker.name.trim() ||
        !newWorker.email.trim() ||
        !newWorker.phone.trim() ||
        !newWorker.address.trim() ||
        !newWorker.password.trim() ||
        !newWorker.workerService
      ) {

        showToast(
          "Please fill all worker fields.",
          "error"
        );

        return;

      }

      try {

        setWorkerCreateLoading(
          true
        );

        const response =
          await createAdminWorker({
            name:
              newWorker.name,
            email:
              newWorker.email,
            phone:
              newWorker.phone,
            address:
              newWorker.address,
            password:
              newWorker.password,
            workerService:
              newWorker.workerService,
            role:
              "WORKER"
          });

        if (response?.data) {

          setWorkers(
            previous => [
              response.data,
              ...previous
            ]
          );

        }

        setNewWorker({
          name: "",
          email: "",
          phone: "",
          address: "",
          password: "",
          workerService: ""
        });

        setCreateWorkerModal(
          false
        );

        showToast(
          "Worker created successfully."
        );

      } catch (error) {

        console.error(error);

        showToast(
          error.response?.data ||
          "Unable to create worker.",
          "error"
        );

      } finally {

        setWorkerCreateLoading(
          false
        );

      }

    };


  /* =========================================================
     WORKER SEARCH
  ========================================================= */

  const filteredWorkers =
    useMemo(() => {

      const search =
        workerSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return workers;
      }

      return workers.filter(
        worker =>
          String(
            worker.name || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            worker.email || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            worker.phone || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            worker.workerService ||
            ""
          )
            .toLowerCase()
            .includes(search)

      );

    }, [
      workers,
      workerSearch
    ]);


  /* =========================================================
     USER SEARCH
  ========================================================= */

  const filteredUsers =
    useMemo(() => {

      const search =
        userSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return users;
      }

      return users.filter(
        customer =>
          String(
            customer.name || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            customer.email || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            customer.phone || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            customer.id || ""
          )
            .toLowerCase()
            .includes(search)

      );

    }, [
      users,
      userSearch
    ]);


  /* =========================================================
     CREATE SERVICE
  ========================================================= */

  const handleCreateService =
    async event => {

      event.preventDefault();

      if (
        !newService.name.trim()
      ) {

        showToast(
          "Service name is required.",
          "error"
        );

        return;

      }

      try {

        setServiceCreateLoading(
          true
        );

        const response =
          await createAdminService({
            name:
              newService.name,
            description:
              newService.description,
            price:
              Number(
                newService.price || 0
              )
          });

        if (response?.data) {

          setServices(
            previous => [
              response.data,
              ...previous
            ]
          );

        }

        setNewService({
          name: "",
          description: "",
          price: ""
        });

        setCreateServiceModal(
          false
        );

        showToast(
          "Service created successfully."
        );

      } catch (error) {

        console.error(error);

        showToast(
          error.response?.data ||
          "Unable to create service.",
          "error"
        );

      } finally {

        setServiceCreateLoading(
          false
        );

      }

    };


  const openEditService = async (service) => {
    if (!service?.id) {
      return;
    }

    setServiceEditLoading(true);

    try {
      const serviceName =
        service?.name?.trim() || "";

      const normalizedName =
        serviceName.toLowerCase();

      let options = [];

      // =====================================================
      // LOAD TUTOR SUBJECTS
      // =====================================================

      if (normalizedName === "tutor") {

        const response =
          await getTutorSubjects();

        options =
          Array.isArray(response?.data)
            ? response.data
            : [];
      }

      // =====================================================
      // LOAD OTHER OPTION SERVICES
      // =====================================================

      else if (
        normalizedName === "beautician" ||
        normalizedName === "house cleaning" ||
        normalizedName === "appliance repair"
      ) {

        const response =
          await getServiceOptions(serviceName);

        options =
          Array.isArray(response?.data)
            ? response.data
            : [];
      }

      // =====================================================
      // SET EDIT STATE
      // =====================================================

      setEditingService({
        id: service.id,

        name:
          service.name || "",

        description:
          service.description || "",

        price:
          service.price !== undefined &&
            service.price !== null
            ? service.price
            : "",

        serviceType:
          service.name || "",

        options: options.map(option => ({
          id: option.id,
          name: option.name || "",
          price:
            option.price !== undefined &&
              option.price !== null
              ? option.price
              : ""
        })),

        newOptions: []
      });

      setEditServiceModal(true);

    } catch (error) {

      console.error(
        "Unable to load service options:",
        error
      );

      showToast(
        "Unable to load service options.",
        "error"
      );

    } finally {

      setServiceEditLoading(false);
    }
  };
  /* =========================================================
    DELETE SERVICE
 ========================================================= */

  const handleDeleteService = (service) => {
    if (!service?.id) {
      return;
    }

    // Open custom confirmation popup
    setDeleteServiceTarget(service);
  };


  /* =========================================================
     CONFIRM DELETE SERVICE
  ========================================================= */

  const confirmDeleteService = async () => {
    if (!deleteServiceTarget?.id) {
      return;
    }

    const serviceId = deleteServiceTarget.id;

    try {
      setServiceDeleteLoading(serviceId);

      await deleteAdminService(serviceId);

      setServices((previous) =>
        previous.filter(
          (item) =>
            String(item.id) !== String(serviceId)
        )
      );

      // Close popup after successful deletion
      setDeleteServiceTarget(null);

      showToast(
        "Service deleted successfully."
      );

    } catch (error) {

      console.error(
        "Unable to delete service:",
        error
      );

      showToast(
        error?.response?.data ||
        "Unable to delete service.",
        "error"
      );

    } finally {

      setServiceDeleteLoading(null);

    }
  };

  /* =========================================================
     CUSTOMER DETAILS
  ========================================================= */

  const openCustomerDetails =
    customer => {

      setSelectedCustomer(
        customer
      );

      setCustomerDetailsModal(
        true
      );

    };


  const customerBookings =
    customer => {

      if (!customer) {
        return [];
      }

      return bookings.filter(
        booking =>
          String(
            booking.userId
          ) ===
          String(
            customer.id
          )
      );

    };


  /* =========================================================
     WORKER DETAILS
  ========================================================= */

  const openWorkerDetails =
    worker => {

      setSelectedWorker(
        worker
      );

      setWorkerDetailsModal(
        true
      );

    };


  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  useEffect(() => {

    const generated = [];

    const pending =
      bookings.filter(
        booking =>
          getStatus(
            booking
          ) === "PENDING"
      ).length;

    const unpaid =
      bookings.filter(
        booking =>
          getPaymentStatus(
            booking
          ) !== "PAID"
      ).length;

    const blockedUsers =
      users.filter(
        customer =>
          customer.blocked
      ).length;

    if (pending > 0) {

      generated.push({
        id: "pending-bookings",
        icon:
          "bi bi-clock-fill",
        title:
          "Pending bookings",
        message:
          `${pending} booking(s) need attention.`,
        type:
          "warning"
      });

    }

    if (unpaid > 0) {

      generated.push({
        id: "pending-payments",
        icon:
          "bi bi-credit-card-fill",
        title:
          "Pending payments",
        message:
          `${unpaid} booking(s) have pending payment.`,
        type:
          "warning"
      });

    }

    if (blockedUsers > 0) {

      generated.push({
        id: "blocked-users",
        icon:
          "bi bi-person-x-fill",
        title:
          "Blocked customers",
        message:
          `${blockedUsers} customer account(s) are blocked.`,
        type:
          "error"
      });

    }

    setNotifications(
      generated
    );

  }, [
    bookings,
    users
  ]);


  /* =========================================================
     ACTIVITY LOG
  ========================================================= */

  const activityLog =
    useMemo(() => {

      const list = [];

      bookings
        .slice()
        .sort(
          (a, b) =>
            Number(b.id || 0) -
            Number(a.id || 0)
        )
        .slice(0, 15)
        .forEach(
          booking => {

            list.push({
              icon:
                "bi bi-calendar-check-fill",
              title:
                `Booking #${booking.id}`,
              text:
                `${booking.name || "Customer"} booked ${booking.service || "a service"}.`,
              date:
                booking.date ||
                booking.scheduledAt
            });

          }
        );

      return list;

    }, [
      bookings
    ]);


  /* =========================================================
 REPORT CSV
========================================================= */

  const createBookingCSV = rows => {
    const headers = [
      "Booking ID",
      "Customer",
      "Service",
      "Date",
      "Worker",
      "Amount",
      "Status",
      "Payment"
    ];

    const csvRows = rows.map(booking => [
      booking?.id ?? "",
      booking?.name ?? "",
      booking?.service ?? "",
      booking?.scheduledAt ||
      booking?.date ||
      "",
      booking?.workerName ||
      booking?.worker?.name ||
      booking?.workerId ||
      "",
      booking?.amount ?? 0,
      booking?.status ?? "",
      booking?.paymentStatus ?? ""
    ]);

    const escapeCSVValue = value => {
      const stringValue = String(value ?? "");

      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    };

    return [
      headers.map(escapeCSVValue).join(","),
      ...csvRows.map(row =>
        row.map(escapeCSVValue).join(",")
      )
    ].join("\n");
  };


  const downloadCSV = (
    rows,
    filename,
    message
  ) => {
    const csvContent = createBookingCSV(rows);

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast(message);
  };


  /* =========================================================
     YEARLY CSV REPORT
  ========================================================= */

  const exportYearlyCSV = () => {
    try {
      const selectedYear =
        Number(reportYear);

      const rows = bookings.filter(
        booking => {
          const date =
            getBookingDateObject(
              booking
            );

          return (
            date &&
            date.getFullYear() ===
            selectedYear
          );
        }
      );

      downloadCSV(
        rows,
        `HiveCare_Booking_Report_${reportYear}.csv`,
        `Yearly booking CSV report for ${reportYear} exported.`
      );
    } catch (error) {
      console.error(
        "Yearly CSV export error:",
        error
      );

      showToast(
        "Unable to export yearly CSV report.",
        "error"
      );
    }
  };


  /* =========================================================
     MONTHLY CSV REPORT
  ========================================================= */

  const exportMonthlyCSV = () => {
    try {
      if (reportMonth === "ALL") {
        showToast(
          "Please select a month for the monthly CSV report.",
          "error"
        );

        return;
      }

      const selectedYear =
        Number(reportYear);

      const selectedMonth =
        Number(reportMonth);

      const rows = bookings.filter(
        booking => {
          const date =
            getBookingDateObject(
              booking
            );

          if (!date) {
            return false;
          }

          return (
            date.getFullYear() ===
            selectedYear &&
            date.getMonth() ===
            selectedMonth
          );
        }
      );

      const monthNumber =
        String(
          selectedMonth + 1
        ).padStart(2, "0");

      downloadCSV(
        rows,
        `HiveCare_Booking_Report_${reportYear}_${monthNumber}.csv`,
        `Monthly booking CSV report for ${monthNames[selectedMonth]} ${reportYear} exported.`
      );
    } catch (error) {
      console.error(
        "Monthly CSV export error:",
        error
      );

      showToast(
        "Unable to export monthly CSV report.",
        "error"
      );
    }
  };


  /* =========================================================
     COMPLETE CSV REPORT
  ========================================================= */

  const exportCSV = () => {
    try {
      downloadCSV(
        bookings,
        "HiveCare_Booking_Report.csv",
        "Complete booking CSV report exported."
      );
    } catch (error) {
      console.error(
        "Complete CSV export error:",
        error
      );

      showToast(
        "Unable to export CSV report.",
        "error"
      );
    }
  };


  /* =========================================================
     PDF REPORT
  ========================================================= */

  const exportPDFReport = () => {
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 15;

      const contentWidth =
        pageWidth -
        margin * 2;


      /* =====================================================
         HELPERS
      ===================================================== */

      const safeText = value => {
        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          return "N/A";
        }

        return String(value);
      };


      const getLines = (
        value,
        width,
        fontSize = 7
      ) => {
        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(fontSize);

        return pdf.splitTextToSize(
          safeText(value),
          width
        );
      };


      const checkPage = (
        currentY,
        requiredHeight = 15
      ) => {
        if (
          currentY +
          requiredHeight >
          pageHeight - 16
        ) {
          pdf.addPage();

          return 20;
        }

        return currentY;
      };


      const sectionTitle = (
        title,
        currentY
      ) => {
        currentY =
          checkPage(
            currentY,
            18
          );

        pdf.setFillColor(
          20,
          91,
          255
        );

        pdf.roundedRect(
          margin,
          currentY - 7,
          contentWidth,
          12,
          3,
          3,
          "F"
        );

        pdf.setTextColor(
          255,
          255,
          255
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(9);

        pdf.text(
          title,
          margin + 5,
          currentY + 1
        );

        pdf.setTextColor(
          25,
          40,
          70
        );

        return currentY + 18;
      };


      /* =====================================================
         STAT CARD
      ===================================================== */

      const drawStatCard = (
        x,
        y,
        width,
        height,
        label,
        value
      ) => {
        pdf.setFillColor(
          248,
          251,
          255
        );

        pdf.setDrawColor(
          220,
          230,
          242
        );

        pdf.roundedRect(
          x,
          y,
          width,
          height,
          3,
          3,
          "FD"
        );

        pdf.setTextColor(
          90,
          105,
          125
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(6.5);

        const labelLines =
          pdf.splitTextToSize(
            safeText(label),
            width - 6
          );

        pdf.text(
          labelLines.slice(0, 2),
          x + 3,
          y + 6
        );

        const valueString =
          safeText(value);

        let valueSize = 11;

        if (
          valueString.length > 16
        ) {
          valueSize = 9;
        }

        if (
          valueString.length > 25
        ) {
          valueSize = 7.5;
        }

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          valueSize
        );

        const valueLines =
          pdf.splitTextToSize(
            valueString,
            width - 6
          );

        pdf.setTextColor(
          20,
          91,
          255
        );

        pdf.text(
          valueLines.slice(0, 2),
          x + 3,
          y + height - 6
        );
      };


      const drawStatGrid = (
        items,
        currentY,
        columns = 4
      ) => {
        const gap = 5;

        const cardWidth =
          (
            contentWidth -
            gap * (columns - 1)
          ) / columns;

        const cardHeight = 27;

        const rows =
          Math.ceil(
            items.length / columns
          );

        currentY =
          checkPage(
            currentY,
            rows * 32
          );

        items.forEach(
          (item, index) => {
            const row =
              Math.floor(
                index / columns
              );

            const column =
              index % columns;

            const x =
              margin +
              column *
              (cardWidth + gap);

            const y =
              currentY +
              row *
              (cardHeight + 5);

            drawStatCard(
              x,
              y,
              cardWidth,
              cardHeight,
              item.label,
              item.value
            );
          }
        );

        return (
          currentY +
          rows *
          (cardHeight + 5)
        );
      };


      const drawField = (
        x,
        currentY,
        width,
        label,
        value
      ) => {
        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(6.5);

        pdf.setTextColor(
          85,
          100,
          120
        );

        pdf.text(
          label,
          x,
          currentY
        );

        const lines =
          getLines(
            value,
            width,
            7
          );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(7);

        pdf.setTextColor(
          35,
          45,
          60
        );

        pdf.text(
          lines,
          x,
          currentY + 4
        );

        return (
          currentY +
          4 +
          lines.length * 3.5 +
          3
        );
      };


      /* =====================================================
         HEADER
      ===================================================== */

      pdf.setFillColor(
        20,
        91,
        255
      );

      pdf.rect(
        0,
        0,
        pageWidth,
        38,
        "F"
      );

      pdf.setTextColor(
        255,
        255,
        255
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(23);

      pdf.text(
        "HIVECARE",
        margin,
        18
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(9);

      pdf.text(
        "Admin Management Report",
        margin,
        27
      );

      const reportPeriod =
        reportMonth === "ALL"
          ? `Year ${reportYear}`
          : `${monthNames[
          Number(reportMonth)
          ]} ${reportYear}`;

      pdf.setFontSize(9);

      pdf.text(
        reportPeriod,
        pageWidth - margin,
        18,
        {
          align: "right"
        }
      );

      pdf.setFontSize(7);

      pdf.text(
        `Generated: ${new Date().toLocaleString("en-IN")}`,
        pageWidth - margin,
        27,
        {
          align: "right"
        }
      );


      /* =====================================================
         PLATFORM SUMMARY
      ===================================================== */

      let y = 52;

      y = sectionTitle(
        "PLATFORM SUMMARY",
        y
      );

      const platformStats = [
        {
          label: "TOTAL BOOKINGS",
          value: bookings.length
        },
        {
          label: "PENDING",
          value:
            bookings.filter(
              b =>
                getStatus(b) ===
                "PENDING"
            ).length
        },
        {
          label: "ACCEPTED",
          value:
            bookings.filter(
              b =>
                getStatus(b) ===
                "ACCEPTED"
            ).length
        },
        {
          label: "COMPLETED",
          value:
            bookings.filter(
              b =>
                getStatus(b) ===
                "COMPLETED"
            ).length
        },
        {
          label: "WORKERS",
          value: workers.length
        },
        {
          label: "CUSTOMERS",
          value: users.length
        },
        {
          label: "SERVICES",
          value: services.length
        },
        {
          label: "PAID BOOKINGS",
          value: paidBookings.length
        },
        {
          label: "PENDING PAYMENTS",
          value:
            pendingPayments.length
        },
        {
          label: "REVENUE",
          value:
            `Rs. ${Number(
              totalRevenue || 0
            ).toFixed(2)}`
        }
      ];

      y =
        drawStatGrid(
          platformStats,
          y,
          5
        ) + 5;


      /* =====================================================
         SELECTED PERIOD
      ===================================================== */

      const selectedBookings =
        bookings.filter(
          booking => {
            const date =
              getBookingDateObject(
                booking
              );

            if (!date) {
              return false;
            }

            const sameYear =
              date.getFullYear() ===
              Number(reportYear);

            if (
              reportMonth === "ALL"
            ) {
              return sameYear;
            }

            return (
              sameYear &&
              date.getMonth() ===
              Number(reportMonth)
            );
          }
        );


      const selectedRevenue =
        selectedBookings
          .filter(
            booking =>
              getPaymentStatus(
                booking
              ) === "PAID"
          )
          .reduce(
            (sum, booking) =>
              sum +
              Number(
                booking?.amount || 0
              ),
            0
          );


      const selectedPendingRevenue =
        selectedBookings
          .filter(
            booking =>
              getPaymentStatus(
                booking
              ) !== "PAID"
          )
          .reduce(
            (sum, booking) =>
              sum +
              Number(
                booking?.amount || 0
              ),
            0
          );


      y =
        sectionTitle(
          `SELECTED PERIOD SUMMARY — ${reportPeriod}`,
          y
        );


      const selectedStats = [
        {
          label: "BOOKINGS",
          value:
            selectedBookings.length
        },
        {
          label: "PENDING",
          value:
            selectedBookings.filter(
              b =>
                getStatus(b) ===
                "PENDING"
            ).length
        },
        {
          label: "ACCEPTED",
          value:
            selectedBookings.filter(
              b =>
                getStatus(b) ===
                "ACCEPTED"
            ).length
        },
        {
          label: "COMPLETED",
          value:
            selectedBookings.filter(
              b =>
                getStatus(b) ===
                "COMPLETED"
            ).length
        },
        {
          label: "REJECTED",
          value:
            selectedBookings.filter(
              b =>
                getStatus(b) ===
                "REJECTED" ||
                getStatus(b) ===
                "REJECT"
            ).length
        },
        {
          label: "PAID",
          value:
            selectedBookings.filter(
              b =>
                getPaymentStatus(
                  b
                ) === "PAID"
            ).length
        },
        {
          label: "COLLECTED",
          value:
            `Rs. ${selectedRevenue.toFixed(
              2
            )}`
        },
        {
          label: "OUTSTANDING",
          value:
            `Rs. ${selectedPendingRevenue.toFixed(
              2
            )}`
        }
      ];


      y =
        drawStatGrid(
          selectedStats,
          y,
          4
        ) + 5;


      /* =====================================================
         YEARLY PERFORMANCE
      ===================================================== */

      y =
        sectionTitle(
          `YEARLY PERFORMANCE — ${reportYear}`,
          y
        );

      const tableX = margin;

      const colWidths = [
        55,
        40,
        40,
        60,
        72
      ];

      const headers = [
        "MONTH",
        "BOOKINGS",
        "PAID",
        "COLLECTED",
        "OUTSTANDING"
      ];

      const drawTableHeader = () => {
        pdf.setFillColor(
          20,
          91,
          255
        );

        pdf.rect(
          tableX,
          y,
          contentWidth,
          9,
          "F"
        );

        pdf.setTextColor(
          255,
          255,
          255
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(7);

        let x = tableX + 3;

        headers.forEach(
          (header, index) => {
            pdf.text(
              header,
              x,
              y + 6
            );

            x +=
              colWidths[index];
          }
        );

        y += 9;
      };


      drawTableHeader();


      monthNames.forEach(
        (month, index) => {
          y =
            checkPage(
              y,
              9
            );

          if (
            y === 20
          ) {
            drawTableHeader();
          }

          const monthBookings =
            bookings.filter(
              booking => {
                const date =
                  getBookingDateObject(
                    booking
                  );

                return (
                  date &&
                  date.getFullYear() ===
                  Number(reportYear) &&
                  date.getMonth() ===
                  index
                );
              }
            );

          const paid =
            monthBookings.filter(
              booking =>
                getPaymentStatus(
                  booking
                ) === "PAID"
            );

          const collected =
            paid.reduce(
              (sum, booking) =>
                sum +
                Number(
                  booking?.amount || 0
                ),
              0
            );

          const outstanding =
            monthBookings
              .filter(
                booking =>
                  getPaymentStatus(
                    booking
                  ) !== "PAID"
              )
              .reduce(
                (sum, booking) =>
                  sum +
                  Number(
                    booking?.amount || 0
                  ),
                0
              );

          pdf.setFillColor(
            index % 2 === 0
              ? 248
              : 255,
            index % 2 === 0
              ? 251
              : 255,
            255
          );

          pdf.setDrawColor(
            225,
            232,
            240
          );

          pdf.rect(
            tableX,
            y,
            contentWidth,
            8,
            "FD"
          );

          pdf.setTextColor(
            45,
            55,
            70
          );

          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(7);

          let x =
            tableX + 3;

          pdf.text(
            month,
            x,
            y + 5.5
          );

          x += colWidths[0];

          pdf.text(
            String(
              monthBookings.length
            ),
            x,
            y + 5.5
          );

          x += colWidths[1];

          pdf.text(
            String(paid.length),
            x,
            y + 5.5
          );

          x += colWidths[2];

          pdf.text(
            `Rs. ${collected.toFixed(2)}`,
            x,
            y + 5.5
          );

          x += colWidths[3];

          pdf.text(
            `Rs. ${outstanding.toFixed(2)}`,
            x,
            y + 5.5
          );

          y += 8;
        }
      );


      y += 8;


      /* =====================================================
         BOOKING DETAILS
      ===================================================== */

      y =
        sectionTitle(
          "BOOKING DETAILS",
          y
        );


      const sortedBookings =
        selectedBookings
          .slice()
          .sort(
            (a, b) =>
              Number(b?.id || 0) -
              Number(a?.id || 0)
          );


      sortedBookings.forEach(
        booking => {

          const leftX =
            margin + 5;

          const rightX =
            margin +
            contentWidth / 2 +
            5;

          const fieldWidth =
            contentWidth / 2 -
            15;


          const customer =
            booking?.name ||
            "Customer";

          const service =
            booking?.service ||
            "Service";

          const worker =
            getWorkerName(
              booking
            );

          const bookingDate =
            getBookingDateObject(
              booking
            );

          const dateText =
            bookingDate
              ? bookingDate.toLocaleString(
                "en-IN"
              )
              : (
                booking?.scheduledAt ||
                booking?.date ||
                "N/A"
              );

          const problem =
            booking?.problemDescription ||
            "N/A";

          const address =
            booking?.address ||
            "N/A";

          const paymentId =
            booking?.razorpayPaymentId ||
            "N/A";


          let leftY =
            y + 9;

          let rightY =
            y + 9;


          const leftFields = [
            [
              "Booking ID",
              booking?.id
            ],
            [
              "Customer",
              customer
            ],
            [
              "Service",
              service
            ],
            [
              "Address",
              address
            ],
            [
              "Problem",
              problem
            ]
          ];


          const rightFields = [
            [
              "Date & Time",
              dateText
            ],
            [
              "Worker",
              worker
            ],
            [
              "Status",
              getStatus(booking)
            ],
            [
              "Payment Status",
              getPaymentStatus(
                booking
              )
            ],
            [
              "Amount",
              `Rs. ${Number(
                booking?.amount || 0
              ).toFixed(2)}`
            ],
            [
              "Payment ID",
              paymentId
            ]
          ];


          const measureFields =
            fields => {
              let height = 0;

              fields.forEach(
                ([label, value]) => {
                  const lines =
                    getLines(
                      value,
                      fieldWidth,
                      7
                    );

                  height +=
                    7 +
                    lines.length *
                    3.5;
                }
              );

              return height;
            };


          const cardHeight =
            Math.max(
              measureFields(
                leftFields
              ),
              measureFields(
                rightFields
              )
            ) + 15;


          y =
            checkPage(
              y,
              cardHeight + 4
            );


          pdf.setFillColor(
            250,
            252,
            255
          );

          pdf.setDrawColor(
            220,
            230,
            242
          );

          pdf.roundedRect(
            margin,
            y,
            contentWidth,
            cardHeight,
            3,
            3,
            "FD"
          );


          pdf.setFillColor(
            20,
            91,
            255
          );

          pdf.roundedRect(
            margin,
            y,
            contentWidth,
            8,
            3,
            3,
            "F"
          );

          pdf.setTextColor(
            255,
            255,
            255
          );

          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.setFontSize(8);

          pdf.text(
            `Booking #${safeText(
              booking?.id
            )}`,
            margin + 5,
            y + 5.5
          );


          leftY =
            y + 13;

          rightY =
            y + 13;


          leftFields.forEach(
            ([label, value]) => {
              leftY =
                drawField(
                  leftX,
                  leftY,
                  fieldWidth,
                  label,
                  value
                );
            }
          );


          rightFields.forEach(
            ([label, value]) => {
              rightY =
                drawField(
                  rightX,
                  rightY,
                  fieldWidth,
                  label,
                  value
                );
            }
          );


          y +=
            cardHeight + 5;
        }
      );


      /* =====================================================
         WORKER DIRECTORY
      ===================================================== */

      y =
        sectionTitle(
          "WORKER DIRECTORY",
          y
        );


      workers.forEach(
        worker => {

          const name =
            worker?.name ||
            "Worker";

          const email =
            worker?.email ||
            "N/A";

          const phone =
            worker?.phone ||
            "N/A";

          const service =
            worker?.workerService ||
            worker?.service ||
            "N/A";

          const availability =
            worker?.blocked
              ? "BLOCKED"
              : (
                worker?.available === false
                  ? "UNAVAILABLE"
                  : "AVAILABLE"
              );


          const workerLines =
            getLines(
              service,
              contentWidth - 10,
              7
            );

          const emailLines =
            getLines(
              email,
              contentWidth / 2 - 10,
              7
            );

          const phoneLines =
            getLines(
              phone,
              contentWidth / 2 - 10,
              7
            );

          const cardHeight =
            28 +
            Math.max(
              workerLines.length,
              1
            ) * 3.5;


          y =
            checkPage(
              y,
              cardHeight + 4
            );


          pdf.setFillColor(
            250,
            252,
            255
          );

          pdf.setDrawColor(
            220,
            230,
            242
          );

          pdf.roundedRect(
            margin,
            y,
            contentWidth,
            cardHeight,
            3,
            3,
            "FD"
          );


          pdf.setTextColor(
            25,
            45,
            70
          );

          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.setFontSize(8);

          pdf.text(
            `${name}  |  ID: ${safeText(
              worker?.id
            )}`,
            margin + 5,
            y + 7
          );


          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(7);

          pdf.text(
            `Status: ${availability}`,
            pageWidth - margin - 5,
            y + 7,
            {
              align: "right"
            }
          );


          drawField(
            margin + 5,
            y + 13,
            contentWidth / 2 - 10,
            "Email",
            email
          );


          drawField(
            margin +
            contentWidth / 2 +
            5,
            y + 13,
            contentWidth / 2 - 10,
            "Phone",
            phone
          );


          drawField(
            margin + 5,
            y + 22,
            contentWidth - 10,
            "Service",
            service
          );


          y +=
            cardHeight + 5;
        }
      );


      /* =====================================================
         SERVICE DIRECTORY
      ===================================================== */

      y =
        sectionTitle(
          "SERVICE DIRECTORY",
          y
        );


      services.forEach(
        service => {

          const description =
            service?.description ||
            "No description available.";

          const descriptionLines =
            getLines(
              description,
              contentWidth - 10,
              7
            );

          const cardHeight =
            25 +
            descriptionLines.length *
            3.5;


          y =
            checkPage(
              y,
              cardHeight + 4
            );


          pdf.setFillColor(
            250,
            252,
            255
          );

          pdf.setDrawColor(
            220,
            230,
            242
          );

          pdf.roundedRect(
            margin,
            y,
            contentWidth,
            cardHeight,
            3,
            3,
            "FD"
          );


          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.setFontSize(8);

          pdf.setTextColor(
            25,
            45,
            70
          );

          pdf.text(
            `${safeText(
              service?.name
            )}  |  ID: ${safeText(
              service?.id
            )}`,
            margin + 5,
            y + 7
          );


          pdf.text(
            `Rs. ${Number(
              service?.price || 0
            ).toFixed(2)}`,
            pageWidth - margin - 5,
            y + 7,
            {
              align: "right"
            }
          );


          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(7);

          pdf.text(
            descriptionLines,
            margin + 5,
            y + 15
          );


          y +=
            cardHeight + 5;
        }
      );


      /* =====================================================
         CUSTOMER DIRECTORY
      ===================================================== */

      y =
        sectionTitle(
          "CUSTOMER DIRECTORY",
          y
        );


      users.forEach(
        customer => {

          const name =
            customer?.name ||
            "Customer";

          const email =
            customer?.email ||
            "N/A";

          const phone =
            customer?.phone ||
            "N/A";

          const address =
            customer?.address ||
            "N/A";

          const blocked =
            customer?.blocked
              ? "BLOCKED"
              : "ACTIVE";


          const addressLines =
            getLines(
              address,
              contentWidth - 10,
              7
            );


          const cardHeight =
            30 +
            addressLines.length *
            3.5;


          y =
            checkPage(
              y,
              cardHeight + 4
            );


          pdf.setFillColor(
            250,
            252,
            255
          );

          pdf.setDrawColor(
            220,
            230,
            242
          );

          pdf.roundedRect(
            margin,
            y,
            contentWidth,
            cardHeight,
            3,
            3,
            "FD"
          );


          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.setFontSize(8);

          pdf.setTextColor(
            25,
            45,
            70
          );

          pdf.text(
            `${name}  |  ID: ${safeText(
              customer?.id
            )}`,
            margin + 5,
            y + 7
          );


          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(7);

          pdf.text(
            blocked,
            pageWidth - margin - 5,
            y + 7,
            {
              align: "right"
            }
          );


          drawField(
            margin + 5,
            y + 13,
            contentWidth / 2 - 10,
            "Email",
            email
          );


          drawField(
            margin +
            contentWidth / 2 +
            5,
            y + 13,
            contentWidth / 2 - 10,
            "Phone",
            phone
          );


          drawField(
            margin + 5,
            y + 22,
            contentWidth - 10,
            "Address",
            address
          );


          y +=
            cardHeight + 5;
        }
      );


      /* =====================================================
         FOOTER ON EVERY PAGE
      ===================================================== */

      const totalPages =
        pdf.internal.getNumberOfPages();


      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        pdf.setPage(page);

        pdf.setDrawColor(
          220,
          230,
          240
        );

        pdf.line(
          margin,
          pageHeight - 13,
          pageWidth - margin,
          pageHeight - 13
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(6.5);

        pdf.setTextColor(
          100,
          110,
          125
        );

        pdf.text(
          "HiveCare Admin Management Report",
          margin,
          pageHeight - 7
        );

        pdf.text(
          reportPeriod,
          pageWidth / 2,
          pageHeight - 7,
          {
            align: "center"
          }
        );

        pdf.text(
          `Page ${page} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 7,
          {
            align: "right"
          }
        );
      }


      /* =====================================================
         SAVE
      ===================================================== */

      const monthPart =
        reportMonth === "ALL"
          ? "YEAR"
          : String(
            Number(reportMonth) + 1
          ).padStart(2, "0");


      pdf.save(
        `HiveCare_Admin_Report_${reportYear}_${monthPart}.pdf`
      );


      showToast(
        "PDF report generated successfully."
      );

    } catch (error) {

      console.error(
        "PDF report error:",
        error
      );

      showToast(
        "Unable to generate PDF report.",
        "error"
      );
    }
  };


  /* =========================================================
     SETTINGS
  ========================================================= */

  const updateSetting =
    (key, value) => {

      const updated = {
        ...settings,
        [key]: value
      };

      setSettings(
        updated
      );

      localStorage.setItem(
        "hivecare_admin_settings",
        JSON.stringify(
          updated
        )
      );

      showToast(
        "Admin settings updated."
      );

    };


  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);

    // Remove JWT token
    authLogout();

    // Go to login
    navigate("/login", {
      replace: true
    });
  };


  if (
    !user ||
    user.role?.toUpperCase() !==
    "ADMIN"
  ) {
    return null;
  }


  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigation = [

    {
      id:
        "dashboard",
      label:
        "Dashboard",
      icon:
        "bi bi-grid-1x2-fill"
    },

    {
      id:
        "bookings",
      label:
        "Bookings",
      icon:
        "bi bi-calendar2-check-fill"
    },

    {
      id:
        "services",
      label:
        "Services",
      icon:
        "bi bi-tools"
    },

    {
      id:
        "workers",
      label:
        "Workers",
      icon:
        "bi bi-person-workspace"
    },

    {
      id:
        "users",
      label:
        "Users",
      icon:
        "bi bi-people-fill"
    },

    {
      id:
        "payments",
      label:
        "Payments",
      icon:
        "bi bi-credit-card-fill"
    },

    {
      id:
        "reviews",
      label:
        "Reviews",
      icon:
        "bi bi-star-fill"
    },

    {
      id:
        "analytics",
      label:
        "Analytics",
      icon:
        "bi bi-bar-chart-fill"
    },

    {
      id:
        "reports",
      label:
        "Reports",
      icon:
        "bi bi-file-earmark-bar-graph-fill"
    },

    {
      id:
        "notifications",
      label:
        "Notifications",
      icon:
        "bi bi-bell-fill"
    },

    {
      id:
        "activity",
      label:
        "Activity",
      icon:
        "bi bi-clock-history"
    },

    {
      id:
        "settings",
      label:
        "Settings",
      icon:
        "bi bi-gear-fill"
    }

  ];


  /* =========================================================
     HEADER TITLE
  ========================================================= */

  const sectionTitles = {

    dashboard:
      "Dashboard",

    bookings:
      "Booking Management",

    services:
      "Service Management",

    workers:
      "Worker Management",

    users:
      "User Management",

    payments:
      "Payment Management",

    reviews:
      "Reviews & Ratings",

    analytics:
      "Analytics",

    reports:
      "Reports",

    notifications:
      "Notifications",

    activity:
      "Activity Log",

    settings:
      "Admin Settings"

  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="admin-page">

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (

        <div
          className={
            "admin-toast " +
            toast.type
          }
        >

          <i
            className={
              toast.type === "error"
                ? "bi bi-exclamation-circle-fill"
                : "bi bi-check-circle-fill"
            }
          />

          <span>
            {toast.message}
          </span>

          <button
            onClick={() =>
              setToast(null)
            }
          >
            <i className="bi bi-x" />
          </button>

        </div>

      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={
          adminMenuOpen
            ? "admin-sidebar admin-sidebar-open"
            : "admin-sidebar"
        }
      >

        <div className="admin-brand">

          <div className="brand-icon">

            <img
              src={logo}
              alt="HiveCare Logo"
              className="hc-logo"
            />

          </div>

          <div>

            <h2>
              HIVECARE
            </h2>

            <span>
              ADMIN PANEL
            </span>

          </div>

        </div>


        <div className="sidebar-label">
          MANAGEMENT
        </div>


        <nav className="sidebar-nav">

          {navigation.map(
            item => (

              <button
                key={item.id}
                className={
                  activeSection ===
                    item.id
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                onClick={() => {
                  setActiveSection(item.id);
                  setAdminMenuOpen(false);
                }}
              >

                <i
                  className={
                    item.icon
                  }
                />

                <span>
                  {item.label}
                </span>

                {item.id ===
                  "bookings" &&
                  bookings.length >
                  0 && (

                    <b>
                      {bookings.length}
                    </b>

                  )}

                {item.id ===
                  "notifications" &&
                  notifications.length >
                  0 && (

                    <b>
                      {
                        notifications.length
                      }
                    </b>

                  )}

              </button>

            )
          )}

        </nav>


        <div className="sidebar-bottom">

          <div className="sidebar-admin">

            <div className="header-avatar">
              {(user?.name || "Admin").trim().charAt(0).toUpperCase()}
            </div>

            <div>

              <strong>
                {user.name ||
                  user.username ||
                  "Administrator"}
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>


          <button
            className="logout-button"
            onClick={logout}
          >

            <i className="bi bi-power" />

            Logout

          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-main">


        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="admin-header">
          <button
            type="button"
            className="admin-hamburger"
            onClick={() =>
              setAdminMenuOpen(
                previous => !previous
              )
            }
            aria-label="Toggle admin menu"
            aria-expanded={adminMenuOpen}
          >
            <i className="bi bi-list" />
          </button>
          <div>

            <span className="header-label">
              HIVECARE MANAGEMENT
            </span>

            <h1>
              {
                sectionTitles[
                activeSection
                ]
              }
            </h1>

          </div>


          <div className="header-right">

            <button
              type="button"
              onClick={
                refreshDashboard
              }
              style={{
                border: "none",
                background:
                  "#edf5ff",
                color:
                  "#1261d8",
                borderRadius:
                  "10px",
                width: "38px",
                height: "38px",
                cursor:
                  "pointer"
              }}
              title="Refresh"
            >

              <i
                className={
                  refreshing
                    ? "bi bi-arrow-clockwise"
                    : "bi bi-arrow-clockwise"
                }
              />

            </button>


            <div className="header-date">

              <i className="bi bi-calendar3" />

              {new Date()
                .toLocaleDateString(
                  "en-IN",
                  {
                    day:
                      "2-digit",
                    month:
                      "short",
                    year:
                      "numeric"
                  }
                )}

            </div>


            <div className="header-profile">

              <div className="header-avatar">
                {(user?.name || "Admin").trim().charAt(0).toUpperCase()}
              </div>

              <div>

                <strong>
                  {user.name ||
                    user.username ||
                    "Admin"}
                </strong>

                <span>
                  Administrator
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* ===================================================
            LOADING
        =================================================== */}

        {loading ? (

          <div className="dashboard-loading">

            <div className="loading-spinner" />

            <h3>
              Loading Dashboard
            </h3>

            <p>
              Preparing your HiveCare management panel...
            </p>

          </div>

        ) : (

          <>


            {/* =================================================
                DASHBOARD
            ================================================= */}

            {activeSection ===
              "dashboard" && (

                <div className="dashboard-content">


                  <section className="blue-welcome">

                    <div>

                      <span>
                        WELCOME BACK 👋
                      </span>

                      <h2>
                        Hello,{" "}
                        {user.name ||
                          user.username ||
                          "Admin"}
                      </h2>

                      <p>
                        Monitor your HiveCare
                        platform from one place.
                      </p>

                    </div>

                    <div className="welcome-graphic">

                      <i className="bi bi-bar-chart-fill" />

                    </div>

                  </section>


                  {/* STATS */}

                  <section className="stats-grid">

                    <StatCard
                      icon="bi bi-calendar2-check-fill"
                      label="Total Bookings"
                      value={
                        stats.bookings ??
                        bookings.length
                      }
                      className="blue"
                    />

                    <StatCard
                      icon="bi bi-tools"
                      label="Services"
                      value={
                        stats.services ??
                        services.length
                      }
                      className="purple"
                    />

                    <StatCard
                      icon="bi bi-person-workspace"
                      label="Workers"
                      value={
                        stats.workers ??
                        workers.length
                      }
                      className="green"
                    />

                    <StatCard
                      icon="bi bi-people-fill"
                      label="Customers"
                      value={
                        stats.users ??
                        users.length
                      }
                      className="orange"
                    />

                  </section>


                  {/* BOOKING + PAYMENT */}

                  <section className="dashboard-columns">


                    <div className="dashboard-card">

                      <CardHeader
                        eyebrow="ACTIVITY"
                        title="Booking Overview"
                        action="View all"
                        onAction={() =>
                          openBookingFilter(
                            "ALL"
                          )
                        }
                      />


                      <div className="overview-grid">

                        <ClickableOverviewBox
                          icon="bi bi-calendar-check-fill"
                          label="All Bookings"
                          value={
                            bookings.length
                          }
                          className="blue"
                          onClick={() =>
                            openBookingFilter(
                              "ALL"
                            )
                          }
                        />


                        <ClickableOverviewBox
                          icon="bi bi-clock-fill"
                          label="Pending"
                          value={
                            bookings.filter(
                              b =>
                                getStatus(
                                  b
                                ) ===
                                "PENDING"
                            ).length
                          }
                          className="orange"
                          onClick={() =>
                            openBookingFilter(
                              "PENDING"
                            )
                          }
                        />


                        <ClickableOverviewBox
                          icon="bi bi-person-check-fill"
                          label="Accepted"
                          value={
                            bookings.filter(
                              b =>
                                getStatus(
                                  b
                                ) ===
                                "ACCEPTED"
                            ).length
                          }
                          className="purple"
                          onClick={() =>
                            openBookingFilter(
                              "ACCEPTED"
                            )
                          }
                        />


                        <ClickableOverviewBox
                          icon="bi bi-check-circle-fill"
                          label="Completed"
                          value={
                            bookings.filter(
                              b =>
                                getStatus(
                                  b
                                ) ===
                                "COMPLETED"
                            ).length
                          }
                          className="green"
                          onClick={() =>
                            openBookingFilter(
                              "COMPLETED"
                            )
                          }
                        />

                      </div>

                    </div>


                    <div className="dashboard-card">

                      <CardHeader
                        eyebrow="FINANCE"
                        title="Payment Summary"
                      />

                      <div className="revenue-main">

                        <div className="revenue-icon">

                          <i className="bi bi-wallet2" />

                        </div>

                        <div>

                          <span>
                            Total Revenue
                          </span>

                          <strong>
                            ₹
                            {totalRevenue.toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </div>

                      </div>


                      <div className="payment-lines">

                        <div>

                          <span>
                            <i className="bi bi-check-circle-fill" />
                            Paid Bookings
                          </span>

                          <strong>
                            {
                              paidBookings.length
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            <i className="bi bi-clock-fill" />
                            Pending Payments
                          </span>

                          <strong>
                            {
                              pendingPayments.length
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            <i className="bi bi-cash-stack" />
                            Pending Amount
                          </span>

                          <strong>
                            ₹
                            {pendingRevenue.toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                        </div>

                      </div>

                    </div>

                  </section>


                  {/* QUICK ADMIN ACTIONS */}

                  <section className="dashboard-card">

                    <CardHeader
                      eyebrow="ADMIN TOOLS"
                      title="Quick Management"
                    />

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(4, 1fr)",
                        gap:
                          "12px"
                      }}
                    >

                      <QuickAction
                        icon="bi bi-calendar2-check-fill"
                        label="Bookings"
                        onClick={() =>
                          setActiveSection(
                            "bookings"
                          )
                        }
                      />

                      <QuickAction
                        icon="bi bi-person-workspace"
                        label="Workers"
                        onClick={() =>
                          setActiveSection(
                            "workers"
                          )
                        }
                      />

                      <QuickAction
                        icon="bi bi-credit-card-fill"
                        label="Payments"
                        onClick={() =>
                          setActiveSection(
                            "payments"
                          )
                        }
                      />

                      <QuickAction
                        icon="bi bi-file-earmark-bar-graph-fill"
                        label="Reports"
                        onClick={() =>
                          setActiveSection(
                            "reports"
                          )
                        }
                      />

                    </div>

                  </section>


                  {/* RECENT BOOKINGS */}

                  <section className="dashboard-card recent-card">

                    <CardHeader
                      eyebrow="LATEST ACTIVITY"
                      title="Recent Bookings"
                      action="View all"
                      onAction={() =>
                        openBookingFilter(
                          "ALL"
                        )
                      }
                    />


                    {bookings.length ===
                      0 ? (

                      <EmptyState />

                    ) : (

                      <div className="recent-list">

                        {bookings
                          .slice()
                          .sort(
                            (a, b) =>
                              Number(
                                b.id || 0
                              ) -
                              Number(
                                a.id || 0
                              )
                          )
                          .slice(0, 5)
                          .map(
                            booking => (

                              <div
                                className="recent-row"
                                key={
                                  booking.id
                                }
                              >

                                <div className="recent-service">

                                  <div className="recent-icon">

                                    <i
                                      className={getServiceIcon(
                                        booking.service
                                      )}
                                    />

                                  </div>

                                  <div>

                                    <strong>
                                      {booking.service ||
                                        "Service"}
                                    </strong>

                                    <span>
                                      #
                                      {
                                        booking.id
                                      }{" "}
                                      •{" "}
                                      {booking.name ||
                                        "Customer"}
                                    </span>

                                  </div>

                                </div>


                                <div className="recent-date">

                                  <i className="bi bi-calendar3" />

                                  {formatDate(
                                    booking.date ||
                                    booking.scheduledAt
                                  )}

                                </div>


                                <div>

                                  <StatusBadge
                                    status={
                                      booking.status
                                    }
                                  />

                                </div>


                                <div className="recent-worker">

                                  <i className="bi bi-person-workspace" />

                                  {getWorkerName(
                                    booking
                                  )}

                                </div>


                                <strong className="recent-price">
                                  ₹
                                  {
                                    booking.amount ??
                                    0
                                  }
                                </strong>

                              </div>

                            )
                          )}

                      </div>

                    )}

                  </section>


                  {/* SERVICES */}

                  <section className="dashboard-card">

                    <CardHeader
                      eyebrow="HIVECARE"
                      title="Available Services"
                      action="View all"
                      onAction={() =>
                        setActiveSection(
                          "services"
                        )
                      }
                    />

                    <div className="service-page-grid">

                      {services.map((service, index) => (

                        <ServiceCard
                          key={service.id || index}

                          service={service}

                          index={index}

                          getServiceIcon={getServiceIcon}

                          displayPrice={
                            getDisplayServicePrice(service)
                          }

                          large={true}

                          openEditService={
                            openEditService
                          }

                          handleDeleteService={
                            handleDeleteService
                          }

                          serviceDeleteLoading={
                            serviceDeleteLoading
                          }
                        />

                      ))}

                    </div>

                  </section>

                </div>

              )}


            {/* =================================================
                BOOKINGS
            ================================================= */}

            {activeSection ===
              "bookings" && (

                <div className="section-content">

                  <PageTitle
                    eyebrow="BOOKING MANAGEMENT"
                    title="All Bookings"
                    description="Monitor bookings, assignment, status and payments."
                    count={
                      filteredBookings.length
                    }
                    countLabel="Bookings"
                  />


                  <div className="filter-panel">

                    <div className="search-box">

                      <i className="bi bi-search" />

                      <input
                        value={bookingSearch}
                        onChange={e =>
                          setBookingSearch(
                            e.target.value
                          )
                        }
                        placeholder="Search by ID, customer, service or worker..."
                      />

                      {bookingSearch && (

                        <button
                          onClick={() =>
                            setBookingSearch("")
                          }
                        >
                          <i className="bi bi-x-circle-fill" />
                        </button>

                      )}

                    </div>


                    <div className="filter-buttons">

                      {[
                        [
                          "ALL",
                          "All"
                        ],
                        [
                          "TODAY",
                          "Today"
                        ],
                        [
                          "TOMORROW",
                          "Tomorrow"
                        ],
                        [
                          "UPCOMING",
                          "Upcoming"
                        ],
                        [
                          "PAST",
                          "Past"
                        ]
                      ].map(
                        ([value, label]) => (

                          <button
                            key={value}
                            className={
                              bookingFilter === value
                                ? "filter-btn active"
                                : "filter-btn"
                            }
                            onClick={() => {

                              setBookingFilter(
                                value
                              );

                              setSelectedDate(
                                ""
                              );

                            }}
                          >

                            {label}

                          </button>

                        )
                      )}


                      {/* =========================
        MONTH FILTER
    ========================= */}

                      <select
                        className="filter-btn"
                        value={selectedMonth}
                        onChange={e => {

                          setSelectedMonth(
                            e.target.value
                          );

                          setBookingFilter(
                            "ALL"
                          );

                          setSelectedDate(
                            ""
                          );

                        }}
                      >

                        <option value="ALL">
                          All Months
                        </option>

                        {monthNames.map(
                          (month, index) => (

                            <option
                              key={index}
                              value={index}
                            >
                              {month}
                            </option>

                          )
                        )}

                      </select>


                      {/* =========================
        YEAR FILTER
    ========================= */}

                      <select
                        className="filter-btn"
                        value={selectedYear}
                        onChange={e => {

                          setSelectedYear(
                            e.target.value
                          );

                          setBookingFilter(
                            "ALL"
                          );

                          setSelectedDate(
                            ""
                          );

                        }}
                      >

                        <option value="ALL">
                          All Years
                        </option>

                        {availableYears.map(
                          year => (

                            <option
                              key={year}
                              value={year}
                            >
                              {year}
                            </option>

                          )
                        )}

                      </select>


                      <select
                        className="filter-btn"
                        value={statusFilter}
                        onChange={e =>
                          setStatusFilter(
                            e.target.value
                          )
                        }
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


                      <select
                        className="filter-btn"
                        value={paymentFilter}
                        onChange={e =>
                          setPaymentFilter(
                            e.target.value
                          )
                        }
                      >

                        <option value="ALL">
                          All Payment
                        </option>

                        <option value="PAID">
                          Paid
                        </option>

                        <option value="PENDING">
                          Pending
                        </option>

                      </select>


                      <div className="custom-date">

                        <i className="bi bi-calendar3" />

                        <input
                          type="date"
                          value={selectedDate}
                          onChange={e => {

                            setSelectedDate(
                              e.target.value
                            );

                            setBookingFilter(
                              "CUSTOM"
                            );

                          }}
                        />

                      </div>


                      {(bookingFilter !== "ALL" ||
                        statusFilter !== "ALL" ||
                        paymentFilter !== "ALL" ||
                        bookingSearch ||
                        selectedDate ||
                        selectedMonth !== "ALL" ||
                        selectedYear !== "ALL") && (

                          <button
                            className="clear-filter"
                            onClick={
                              clearFilters
                            }
                          >
                            Clear
                          </button>

                        )}

                    </div>

                  </div>






                  <BookingTable
                    bookings={
                      filteredBookings
                    }
                    getWorkerName={
                      getWorkerName
                    }
                    getWorkerId={
                      getBookingWorkerId
                    }
                    formatDate={
                      formatDate
                    }
                    getStatus={
                      getStatus
                    }
                    getPaymentStatus={
                      getPaymentStatus
                    }
                    viewReceipt={
                      viewReceipt
                    }
                    downloadReceiptPDF={
                      downloadReceiptPDF
                    }
                    openDeleteModal={
                      openDeleteModal
                    }
                    deleteLoading={
                      deleteLoading
                    }
                    openBookingDetails={
                      openBookingDetails
                    }
                    openAssignment={
                      openAssignment
                    }
                  />

                </div>

              )}


            {/* =================================================
                SERVICES
            ================================================= */}

            {activeSection ===
              "services" && (

                <div className="section-content">

                  <PageTitle
                    eyebrow="SERVICE MANAGEMENT"
                    title="Our Services"
                    description="Manage HiveCare services and pricing."
                    count={
                      services.length
                    }
                    countLabel="Services"
                  />


                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "flex-end"
                    }}
                  >

                    <button
                      className="create-worker-btn"
                      onClick={() =>
                        setCreateServiceModal(
                          true
                        )
                      }
                    >

                      <i className="bi bi-plus-lg" />

                      Create Service

                    </button>

                  </div>



                  <div className="service-page-grid">

                    {services.map((service, index) => (

                      <ServiceCard
                        key={service.id || index}

                        service={service}

                        index={index}

                        getServiceIcon={getServiceIcon}

                        displayPrice={
                          getDisplayServicePrice(service)
                        }

                        large={true}

                        openEditService={
                          openEditService
                        }

                        handleDeleteService={
                          handleDeleteService
                        }

                        serviceDeleteLoading={
                          serviceDeleteLoading
                        }
                      />

                    ))}

                  </div>



                </div>

              )}


            {/* =================================================
                WORKERS
            ================================================= */}

            {activeSection ===
              "workers" && (

                <div className="section-content">

                  <PageTitle
                    eyebrow="WORKFORCE"
                    title="Service Workers"
                    description="Monitor worker performance, availability and account status."
                    count={
                      workers.length
                    }
                    countLabel="Workers"
                  />


                  <div className="worker-toolbar">

                    <div className="worker-search-box">

                      <i className="bi bi-search" />

                      <input
                        value={
                          workerSearch
                        }
                        onChange={
                          e =>
                            setWorkerSearch(
                              e.target.value
                            )
                        }
                        placeholder="Search workers..."
                      />

                      {workerSearch && (

                        <button
                          onClick={() =>
                            setWorkerSearch(
                              ""
                            )
                          }
                        >

                          <i className="bi bi-x-circle-fill" />

                        </button>

                      )}

                    </div>


                    <button
                      className="create-worker-btn"
                      onClick={() =>
                        setCreateWorkerModal(
                          true
                        )
                      }
                    >

                      <i className="bi bi-person-plus-fill" />

                      Create Worker

                    </button>

                  </div>


                  <div className="people-grid">

                    {filteredWorkers.map(
                      worker => {

                        const workerStats =
                          getWorkerStats(
                            worker
                          );

                        const online =
                          Boolean(
                            worker.available
                          );

                        return (

                          <div
                            className={
                              "person-card"
                            }
                            key={
                              worker.id
                            }
                            onDoubleClick={() =>
                              openWorkerDetails(
                                worker
                              )
                            }
                          >

                            <div className="person-top">

                              <div className="person-avatar worker">

                                <i className="bi bi-person-workspace" />

                              </div>


                              <span
                                className={
                                  worker.blocked
                                    ? "customer-pill blocked"
                                    : "customer-pill"
                                }
                              >

                                {worker.blocked
                                  ? "Blocked"
                                  : "Worker"}

                              </span>

                            </div>


                            <h3>
                              {worker.name ||
                                "Worker"}
                            </h3>


                            <div className="person-service">

                              <i className="bi bi-tools" />

                              {worker.workerService ||
                                "Service Professional"}

                            </div>


                            <div className="person-contact">

                              <div>

                                <i className="bi bi-envelope-fill" />

                                <span>
                                  {worker.email ||
                                    "No email"}
                                </span>

                              </div>


                              <div>

                                <i className="bi bi-telephone-fill" />

                                <span>
                                  {worker.phone ||
                                    "No phone"}
                                </span>

                              </div>


                              <div>

                                <i className="bi bi-circle-fill" />

                                <span
                                  style={{
                                    color:
                                      online
                                        ? "#16834b"
                                        : "#68707a",
                                    fontWeight:
                                      700
                                  }}
                                >

                                  {online
                                    ? "Online"
                                    : "Offline"}

                                </span>

                              </div>

                            </div>


                            <div className="worker-stats">

                              <div className="worker-stat completed">

                                <i className="bi bi-check-circle-fill" />

                                <div>

                                  <span>
                                    Completed
                                  </span>

                                  <strong>
                                    {
                                      workerStats.completed
                                    }
                                  </strong>

                                </div>

                              </div>


                              <div className="worker-stat pending">

                                <i className="bi bi-clock-fill" />

                                <div>

                                  <span>
                                    Pending
                                  </span>

                                  <strong>
                                    {
                                      workerStats.pending
                                    }
                                  </strong>

                                </div>

                              </div>


                              <div className="worker-stat rejected">

                                <i className="bi bi-x-circle-fill" />

                                <div>

                                  <span>
                                    Rejected
                                  </span>

                                  <strong>
                                    {
                                      workerStats.rejected
                                    }
                                  </strong>

                                </div>

                              </div>

                            </div>


                            <div
                              style={{
                                display:
                                  "grid",
                                gridTemplateColumns:
                                  "1fr 1fr",
                                gap:
                                  "8px",
                                marginTop:
                                  "12px"
                              }}
                            >

                              <button
                                className={
                                  worker.blocked
                                    ? "user-status-btn unblock"
                                    : "user-status-btn block"
                                }
                                style={{
                                  marginTop:
                                    0
                                }}
                                disabled={
                                  workerActionLoading ===
                                  worker.id
                                }
                                onClick={() =>
                                  handleWorkerBlockToggle(
                                    worker
                                  )
                                }
                              >

                                {workerActionLoading ===
                                  worker.id ? (

                                  <span>
                                    Processing...
                                  </span>

                                ) : worker.blocked ? (

                                  <>
                                    <i className="bi bi-unlock-fill" />
                                    Activate
                                  </>

                                ) : (

                                  <>
                                    <i className="bi bi-slash-circle-fill" />
                                    Block
                                  </>

                                )}

                              </button>


                              <button
                                type="button"
                                onClick={() =>
                                  openWorkerDetails(
                                    worker
                                  )
                                }
                                style={{
                                  border:
                                    "1px solid #dbe5f5",
                                  background:
                                    "#f7faff",
                                  color:
                                    "#1261d8",
                                  borderRadius:
                                    "10px",
                                  fontWeight:
                                    700,
                                  cursor:
                                    "pointer"
                                }}
                              >

                                <i className="bi bi-eye-fill" />

                                {" "}
                                Details

                              </button>

                            </div>

                          </div>

                        );

                      }
                    )}

                  </div>

                </div>

              )}


            {/* =================================================
                USERS
            ================================================= */}

            {activeSection ===
              "users" && (

                <div className="section-content">

                  <PageTitle
                    eyebrow="CUSTOMERS"
                    title="Registered Users"
                    description="Manage customer accounts and view booking history."
                    count={
                      filteredUsers.length
                    }
                    countLabel="Users"
                  />


                  <div className="filter-panel">

                    <div className="search-box">

                      <i className="bi bi-search" />

                      <input
                        value={
                          userSearch
                        }
                        onChange={
                          e =>
                            setUserSearch(
                              e.target.value
                            )
                        }
                        placeholder="Search customer by name, email, phone or ID..."
                      />

                    </div>

                  </div>


                  <div className="people-grid">

                    {filteredUsers.map(
                      customer => {

                        const blocked =
                          Boolean(
                            customer.blocked
                          );

                        const count =
                          customerBookings(
                            customer
                          ).length;

                        return (

                          <div
                            className="person-card"
                            key={
                              customer.id
                            }
                          >

                            <div className="person-top">

                              <div className="person-avatar user">

                                <i className="bi bi-person-fill" />

                              </div>


                              <span
                                className={
                                  blocked
                                    ? "customer-pill blocked"
                                    : "customer-pill"
                                }
                              >

                                {blocked
                                  ? "Blocked"
                                  : "Customer"}

                              </span>

                            </div>


                            <h3>
                              {customer.name ||
                                "User"}
                            </h3>


                            <div className="person-contact">

                              <div>

                                <i className="bi bi-person-badge-fill" />

                                <span>
                                  ID:{" "}
                                  {customer.id ||
                                    "N/A"}
                                </span>

                              </div>


                              <div>

                                <i className="bi bi-envelope-fill" />

                                <span>
                                  {customer.email ||
                                    "No email"}
                                </span>

                              </div>


                              <div>

                                <i className="bi bi-telephone-fill" />

                                <span>
                                  {customer.phone ||
                                    "No phone"}
                                </span>

                              </div>


                              <div>

                                <i className="bi bi-calendar-check-fill" />

                                <span>
                                  {
                                    count
                                  }{" "}
                                  booking(s)
                                </span>

                              </div>

                            </div>


                            <div
                              style={{
                                display:
                                  "grid",
                                gridTemplateColumns:
                                  "1fr 1fr",
                                gap:
                                  "8px"
                              }}
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  openCustomerDetails(
                                    customer
                                  )
                                }
                                style={{
                                  marginTop:
                                    "18px",
                                  padding:
                                    "11px",
                                  border:
                                    "1px solid #dbe5f5",
                                  background:
                                    "#f7faff",
                                  color:
                                    "#1261d8",
                                  borderRadius:
                                    "10px",
                                  fontWeight:
                                    700,
                                  cursor:
                                    "pointer"
                                }}
                              >

                                <i className="bi bi-eye-fill" />

                                {" "}
                                Details

                              </button>


                              <button
                                className={
                                  blocked
                                    ? "user-status-btn unblock"
                                    : "user-status-btn block"
                                }
                                style={{
                                  marginTop:
                                    "18px"
                                }}
                                disabled={
                                  userActionLoading ===
                                  customer.id
                                }
                                onClick={() =>
                                  handleUserBlockToggle(
                                    customer
                                  )
                                }
                              >

                                {blocked
                                  ? "Activate"
                                  : "Block"}

                              </button>

                            </div>

                          </div>

                        );

                      }
                    )}

                  </div>

                </div>

              )}


            {/* =================================================
                PAYMENTS
            ================================================= */}

            {activeSection ===
              "payments" && (

                <div className="section-content">

                  <PageTitle
                    eyebrow="FINANCE"
                    title="Payment Details"
                    description="Monitor paid and pending HiveCare payments."
                    count={
                      paymentBookings.length
                    }
                    countLabel="Payments"
                  />


                  <section className="stats-grid">

                    <StatCard
                      icon="bi bi-wallet2"
                      label="Revenue"
                      value={
                        "₹" +
                        totalRevenue.toLocaleString(
                          "en-IN"
                        )
                      }
                      className="blue"
                    />

                    <StatCard
                      icon="bi bi-check-circle-fill"
                      label="Paid"
                      value={
                        paidBookings.length
                      }
                      className="green"
                    />

                    <StatCard
                      icon="bi bi-clock-fill"
                      label="Pending"
                      value={
                        pendingPayments.length
                      }
                      className="orange"
                    />

                    <StatCard
                      icon="bi bi-cash-stack"
                      label="Pending Amount"
                      value={
                        "₹" +
                        pendingRevenue.toLocaleString(
                          "en-IN"
                        )
                      }
                      className="purple"
                    />

                  </section>


                  <div className="filter-panel">

                    <div className="search-box">

                      <i className="bi bi-search" />

                      <input
                        value={
                          paymentSearch
                        }
                        onChange={
                          e =>
                            setPaymentSearch(
                              e.target.value
                            )
                        }
                        placeholder="Search payment by booking ID, customer or service..."
                      />

                    </div>

                  </div>


                  <BookingTable
                    bookings={
                      paymentBookings
                    }
                    getWorkerName={
                      getWorkerName
                    }
                    getWorkerId={
                      getBookingWorkerId
                    }
                    formatDate={
                      formatDate
                    }
                    getStatus={
                      getStatus
                    }
                    getPaymentStatus={
                      getPaymentStatus
                    }
                    viewReceipt={
                      viewReceipt
                    }
                    downloadReceiptPDF={
                      downloadReceiptPDF
                    }
                    openDeleteModal={
                      openDeleteModal
                    }
                    deleteLoading={
                      deleteLoading
                    }
                    openBookingDetails={
                      openBookingDetails
                    }
                    openAssignment={
                      openAssignment
                    }
                    paymentOnly
                  />

                </div>

              )}


            {/* =================================================
                REVIEWS
            ================================================= */}

            {activeSection ===
              "reviews" && (

                <div className="section-content">

                  <PageTitle
                    eyebrow="CUSTOMER FEEDBACK"
                    title="Reviews & Ratings"
                    description="Monitor customer feedback received from completed services."
                    count={
                      reviews.length
                    }
                    countLabel="Reviews"
                  />


                  {reviews.length === 0 ? (

                    <div className="dashboard-card">

                      <EmptyState />

                    </div>

                  ) : (

                    <div className="people-grid">

                      {reviews.map((review) => (

                        <div
                          className="person-card"
                          key={review.id}
                        >

                          <div className="person-top">

                            <div className="person-avatar user">

                              <i className="bi bi-star-fill" />

                            </div>

                            <span className="customer-pill">

                              #{review.id}

                            </span>

                          </div>

                          <h3>
                            {review.customerName ||
                              "Customer"}
                          </h3>

                          <div className="person-service">

                            <i
                              className={getServiceIcon(
                                review.service
                              )}
                            />

                            {review.service ||
                              "HiveCare Service"}

                          </div>

                          <div
                            style={{
                              marginTop: "15px",
                              color: "#f59e0b",
                              fontSize: "18px"
                            }}
                          >

                            {"★".repeat(
                              Math.max(
                                0,
                                Math.min(
                                  5,
                                  Number(
                                    review.rating || 0
                                  )
                                )
                              )
                            )}

                            {"☆".repeat(
                              Math.max(
                                0,
                                5 -
                                Math.min(
                                  5,
                                  Number(
                                    review.rating || 0
                                  )
                                )
                              )
                            )}

                            <span
                              style={{
                                color: "#8a99ae",
                                fontSize: "11px",
                                marginLeft: "7px"
                              }}
                            >
                              {review.rating || 0}/5
                            </span>

                          </div>

                          <p
                            style={{
                              marginTop: "15px",
                              color: "#5f718c",
                              fontSize: "12px",
                              lineHeight: "1.7"
                            }}
                          >
                            "{review.comment ||
                              "No written review."}"
                          </p>

                          <div
                            style={{
                              marginTop: "10px",
                              color: "#6d7d92",
                              fontSize: "11px"
                            }}
                          >
                            <strong>Worker:</strong>{" "}
                            {review.workerName ||
                              "Worker"}
                          </div>

                          <span
                            style={{
                              color: "#8a99ae",
                              fontSize: "10px",
                              display: "block",
                              marginTop: "8px"
                            }}
                          >
                            {review.createdAt
                              ? new Date(
                                review.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                              : ""}
                          </span>

                          <button
                            type="button"
                            className="user-status-btn block"
                            style={{
                              marginTop: "15px"
                            }}
                            onClick={() =>
                              handleDeleteReview(
                                review.id
                              )
                            }
                          >
                            <i className="bi bi-trash-fill" />
                            Delete Review
                          </button>

                        </div>

                      ))}

                    </div>

                  )}
                </div>

              )}


            {/* =================================================
                ANALYTICS
            ================================================= */}

            {activeSection ===
              "analytics" && (

                <div className="section-content">

                  <PageTitle
                    eyebrow="BUSINESS INTELLIGENCE"
                    title="Booking & Revenue Analytics"
                    description="Understand HiveCare booking, service, worker and payment performance."
                    count={
                      bookings.length
                    }
                    countLabel="Bookings"
                  />


                  <section className="stats-grid">

                    <StatCard
                      icon="bi bi-calendar-check-fill"
                      label="Completed"
                      value={
                        bookings.filter(
                          b =>
                            getStatus(
                              b
                            ) ===
                            "COMPLETED"
                        ).length
                      }
                      className="green"
                    />

                    <StatCard
                      icon="bi bi-hourglass-split"
                      label="Pending"
                      value={
                        bookings.filter(
                          b =>
                            getStatus(
                              b
                            ) ===
                            "PENDING"
                        ).length
                      }
                      className="orange"
                    />

                    <StatCard
                      icon="bi bi-person-check-fill"
                      label="Assigned"
                      value={
                        bookings.filter(
                          b =>
                            getBookingWorkerId(
                              b
                            )
                        ).length
                      }
                      className="blue"
                    />

                    <StatCard
                      icon="bi bi-star-fill"
                      label="Reviews"
                      value={
                        reviews.length
                      }
                      className="purple"
                    />

                  </section>


                  <div className="dashboard-columns">


                    <div className="dashboard-card">

                      <CardHeader
                        eyebrow="SERVICE DEMAND"
                        title="Bookings by Service"
                      />

                      {services.map(
                        service => {

                          const count =
                            bookings.filter(
                              booking =>
                                String(
                                  booking.service ||
                                  ""
                                ).toLowerCase() ===
                                String(
                                  service.name ||
                                  ""
                                ).toLowerCase()
                            ).length;

                          const percentage =
                            bookings.length
                              ? Math.round(
                                (count /
                                  bookings.length) *
                                100
                              )
                              : 0;

                          return (

                            <div
                              key={
                                service.id ||
                                service.name
                              }
                              style={{
                                marginBottom:
                                  "16px"
                              }}
                            >

                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  marginBottom:
                                    "6px"
                                }}
                              >

                                <span
                                  style={{
                                    fontSize:
                                      "11px",
                                    color:
                                      "#536985",
                                    fontWeight:
                                      700
                                  }}
                                >
                                  {service.name}
                                </span>

                                <strong
                                  style={{
                                    fontSize:
                                      "11px",
                                    color:
                                      "#1261d8"
                                  }}
                                >
                                  {count}
                                </strong>

                              </div>


                              <div
                                style={{
                                  height:
                                    "8px",
                                  borderRadius:
                                    "20px",
                                  background:
                                    "#eaf1fb",
                                  overflow:
                                    "hidden"
                                }}
                              >

                                <div
                                  style={{
                                    width:
                                      percentage +
                                      "%",
                                    height:
                                      "100%",
                                    background:
                                      "linear-gradient(90deg,#1261d8,#6b8cff)",
                                    borderRadius:
                                      "20px"
                                  }}
                                />

                              </div>

                            </div>

                          );

                        }
                      )}

                    </div>


                    <div className="dashboard-card">

                      <CardHeader
                        eyebrow="WORKER PERFORMANCE"
                        title="Top Workers"
                      />

                      {workers
                        .map(
                          worker => ({
                            worker,
                            stats:
                              getWorkerStats(
                                worker
                              )
                          })
                        )
                        .sort(
                          (a, b) =>
                            b.stats.completed -
                            a.stats.completed
                        )
                        .slice(
                          0,
                          6
                        )
                        .map(
                          item => (

                            <div
                              key={
                                item.worker.id
                              }
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "space-between",
                                padding:
                                  "12px 0",
                                borderBottom:
                                  "1px solid #edf2f7"
                              }}
                            >

                              <div>

                                <strong
                                  style={{
                                    display:
                                      "block",
                                    color:
                                      "#243858",
                                    fontSize:
                                      "12px"
                                  }}
                                >
                                  {
                                    item.worker.name
                                  }
                                </strong>

                                <span
                                  style={{
                                    color:
                                      "#8292a9",
                                    fontSize:
                                      "9px"
                                  }}
                                >
                                  {
                                    item.worker.workerService ||
                                    "Service Worker"
                                  }
                                </span>

                              </div>

                              <strong
                                style={{
                                  color:
                                    "#079160"
                                }}
                              >
                                {
                                  item.stats.completed
                                }{" "}
                                completed
                              </strong>

                            </div>

                          )
                        )}

                    </div>

                  </div>


                  <div className="analytics-section">
                    <div className="section-header">
                      <div>
                        <h3>Revenue Breakdown</h3>
                        <p>
                          Revenue performance by month
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          flexWrap: "wrap"
                        }}
                      >
                        <select
                          value={analyticsYear}
                          onChange={e =>
                            setAnalyticsYear(e.target.value)
                          }
                          className="form-control"
                        >
                          {availableYears.map(year => (
                            <option
                              key={year}
                              value={year}
                            >
                              {year}
                            </option>
                          ))}
                        </select>

                        <select
                          value={analyticsMonth}
                          onChange={e =>
                            setAnalyticsMonth(e.target.value)
                          }
                          className="form-control"
                        >
                          <option value="ALL">
                            All Months
                          </option>

                          {monthNames.map(
                            (month, index) => (
                              <option
                                key={month}
                                value={index}
                              >
                                {month}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="analytics-grid">
                      <AnalyticsBox
                        title="Total Value"
                        value={`₹${(
                          analyticsYearCollected +
                          analyticsYearOutstanding
                        ).toLocaleString("en-IN")}`}
                      />

                      <AnalyticsBox
                        title={
                          analyticsMonth === "ALL"
                            ? "Collected"
                            : `Collected - ${monthNames[
                            Number(analyticsMonth)
                            ]
                            }`
                        }
                        value={`₹${analyticsCollected.toLocaleString(
                          "en-IN"
                        )}`}
                      />

                      <AnalyticsBox
                        title="Outstanding"
                        value={`₹${analyticsYearOutstanding.toLocaleString(
                          "en-IN"
                        )}`}
                      />
                    </div>

                    <div
                      className="table-responsive"
                      style={{ marginTop: "20px" }}
                    >
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Bookings</th>
                            <th>Collected Revenue</th>
                            <th>Outstanding</th>
                          </tr>
                        </thead>

                        <tbody>
                          {analyticsRows.map(
                            (row, index) => {
                              const isSelected =
                                analyticsMonth !== "ALL" &&
                                Number(analyticsMonth) ===
                                index;

                              return (
                                <tr
                                  key={row.month}
                                  style={
                                    isSelected
                                      ? {
                                        background:
                                          "#edf5ff",
                                        fontWeight: "700"
                                      }
                                      : undefined
                                  }
                                >
                                  <td>
                                    {row.month}
                                  </td>

                                  <td>
                                    {row.bookings}
                                  </td>

                                  <td>
                                    ₹
                                    {row.collected.toLocaleString(
                                      "en-IN"
                                    )}
                                  </td>

                                  <td>
                                    ₹
                                    {row.outstanding.toLocaleString(
                                      "en-IN"
                                    )}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              )}


            {/* =================================================
                REPORTS
            ================================================= */}

            {activeSection ===
              "reports" && (

                <div className="section-content">

                  <PageTitle
                    eyebrow="REPORT CENTER"
                    title="HiveCare Reports"
                    description="Export HiveCare operational and financial information."
                    count={
                      bookings.length
                    }
                    countLabel="Records"
                  />


                  <div className="dashboard-columns">


                    <div className="report-card">
                      <div className="report-card-header">
                        <div>
                          <h3>Booking Report</h3>

                          <p>
                            Generate booking reports in CSV format.
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "16px",
                          padding: "16px",
                          borderRadius: "10px",
                          background: "#f7faff",
                          border: "1px solid #dbe8f7"
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            flexWrap: "wrap",
                            alignItems: "flex-end"
                          }}
                        >
                          {/* YEAR */}
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "6px",
                                fontWeight: "600"
                              }}
                            >
                              Year
                            </label>

                            <select
                              value={reportYear}
                              onChange={e =>
                                setReportYear(e.target.value)
                              }
                              className="form-control"
                            >
                              {availableYears.map(year => (
                                <option
                                  key={year}
                                  value={year}
                                >
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* MONTH */}
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "6px",
                                fontWeight: "600"
                              }}
                            >
                              Month
                            </label>

                            <select
                              value={reportMonth}
                              onChange={e =>
                                setReportMonth(e.target.value)
                              }
                              className="form-control"
                            >
                              <option value="ALL">
                                All Months / Yearly
                              </option>

                              {monthNames.map((month, index) => (
                                <option
                                  key={month}
                                  value={index}
                                >
                                  {month}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* DOWNLOAD BUTTON */}
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                              flexWrap: "wrap"
                            }}
                          >
                            {reportMonth === "ALL" ? (
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={exportYearlyCSV}
                              >
                                <i className="bi bi-calendar-range" />
                                &nbsp; Download Yearly CSV
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={exportMonthlyCSV}
                              >
                                <i className="bi bi-calendar-month" />
                                &nbsp; Download Monthly CSV
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={exportCSV}
                            >
                              <i className="bi bi-file-earmark-spreadsheet-fill" />
                              &nbsp; Booking CSV
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>


                    <div className="dashboard-card">

                      <CardHeader
                        eyebrow="MANAGEMENT"
                        title="Admin PDF Report"
                      />

                      <p
                        style={{
                          color:
                            "#71819a",
                          fontSize:
                            "12px",
                          lineHeight:
                            "1.7"
                        }}
                      >
                        Generate a professional PDF summary of HiveCare
                        bookings, workers, customers, services and revenue.
                      </p>


                      <button
                        className="create-worker-btn"
                        style={{
                          marginTop:
                            "15px"
                        }}
                        onClick={
                          exportPDFReport
                        }
                      >

                        <i className="bi bi-file-earmark-pdf-fill" />

                        Generate PDF

                      </button>

                    </div>

                  </div>


                  <div className="dashboard-card">

                    <CardHeader
                      eyebrow="SUMMARY"
                      title="Current Platform Statistics"
                    />

                    <div className="overview-grid">

                      <OverviewBox
                        icon="bi bi-calendar-check-fill"
                        label="Bookings"
                        value={
                          bookings.length
                        }
                        className="blue"
                      />

                      <OverviewBox
                        icon="bi bi-tools"
                        label="Services"
                        value={
                          services.length
                        }
                        className="purple"
                      />

                      <OverviewBox
                        icon="bi bi-person-workspace"
                        label="Workers"
                        value={
                          workers.length
                        }
                        className="green"
                      />

                      <OverviewBox
                        icon="bi bi-people-fill"
                        label="Customers"
                        value={
                          users.length
                        }
                        className="orange"
                      />

                    </div>

                  </div>

                </div>

              )}


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            {activeSection ===
              "notifications" && (

                <div className="section-content">

                  <PageTitle
                    eyebrow="SYSTEM ALERTS"
                    title="Notifications"
                    description="Important actions and alerts from your HiveCare platform."
                    count={
                      notifications.length
                    }
                    countLabel="Alerts"
                  />


                  {notifications.length ===
                    0 ? (

                    <div className="dashboard-card">

                      <EmptyState />

                    </div>

                  ) : (

                    <div className="dashboard-card">

                      {notifications.map(
                        notification => (

                          <div
                            key={
                              notification.id
                            }
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "14px",
                              padding:
                                "15px",
                              marginBottom:
                                "10px",
                              borderRadius:
                                "12px",
                              background:
                                notification.type ===
                                  "error"
                                  ? "#fff1f1"
                                  : "#fff8ed",
                              border:
                                "1px solid #edf2f7"
                            }}
                          >

                            <div
                              style={{
                                width:
                                  "42px",
                                height:
                                  "42px",
                                borderRadius:
                                  "12px",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                background:
                                  "#ffffff",
                                color:
                                  "#1261d8"
                              }}
                            >

                              <i
                                className={
                                  notification.icon
                                }
                              />

                            </div>


                            <div
                              style={{
                                flex:
                                  1
                              }}
                            >

                              <strong
                                style={{
                                  display:
                                    "block",
                                  color:
                                    "#263b5b",
                                  fontSize:
                                    "13px"
                                }}
                              >
                                {
                                  notification.title
                                }
                              </strong>

                              <span
                                style={{
                                  display:
                                    "block",
                                  marginTop:
                                    "4px",
                                  color:
                                    "#71819a",
                                  fontSize:
                                    "11px"
                                }}
                              >
                                {
                                  notification.message
                                }
                              </span>

                            </div>


                            <button
                              style={{
                                border:
                                  "none",
                                background:
                                  "#edf5ff",
                                color:
                                  "#1261d8",
                                padding:
                                  "8px 12px",
                                borderRadius:
                                  "9px",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  700
                              }}
                              onClick={() => {

                                if (
                                  notification.id ===
                                  "pending-bookings"
                                ) {
                                  openBookingFilter(
                                    "PENDING"
                                  );
                                }

                                if (
                                  notification.id ===
                                  "pending-payments"
                                ) {
                                  setActiveSection(
                                    "payments"
                                  );
                                }

                              }}
                            >

                              View

                            </button>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              )}


            {/* =================================================
                ACTIVITY
            ================================================= */}

            {activeSection ===
              "activity" && (

                <div className="section-content">

                  <PageTitle
                    eyebrow="ADMIN AUDIT"
                    title="Activities"
                    description="Recent booking activity visible to the administrator."
                    count={
                      activityLog.length
                    }
                    countLabel="Activities"
                  />


                  <div className="dashboard-card">

                    {activityLog.length ===
                      0 ? (

                      <EmptyState />

                    ) : (

                      activityLog.map(
                        (activity, index) => (

                          <div
                            key={
                              index
                            }
                            style={{
                              display:
                                "flex",
                              gap:
                                "14px",
                              padding:
                                "15px 0",
                              borderBottom:
                                index ===
                                  activityLog.length -
                                  1
                                  ? "none"
                                  : "1px solid #edf2f7"
                            }}
                          >

                            <div
                              style={{
                                width:
                                  "40px",
                                height:
                                  "40px",
                                flexShrink:
                                  0,
                                borderRadius:
                                  "11px",
                                background:
                                  "#eaf3ff",
                                color:
                                  "#1261d8",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center"
                              }}
                            >

                              <i
                                className={
                                  activity.icon
                                }
                              />

                            </div>


                            <div>

                              <strong
                                style={{
                                  display:
                                    "block",
                                  color:
                                    "#243858",
                                  fontSize:
                                    "12px"
                                }}
                              >
                                {
                                  activity.title
                                }
                              </strong>

                              <span
                                style={{
                                  display:
                                    "block",
                                  marginTop:
                                    "4px",
                                  color:
                                    "#687c99",
                                  fontSize:
                                    "11px"
                                }}
                              >
                                {
                                  activity.text
                                }
                              </span>

                              <small
                                style={{
                                  display:
                                    "block",
                                  marginTop:
                                    "5px",
                                  color:
                                    "#9aa8ba",
                                  fontSize:
                                    "9px"
                                }}
                              >
                                {
                                  formatDate(
                                    activity.date
                                  )
                                }
                              </small>

                            </div>

                          </div>

                        )
                      )

                    )}

                  </div>

                </div>

              )}


            {/* =================================================
                SETTINGS
            ================================================= */}

            {activeSection ===
              "settings" && (

                <div className="section-content">

                  <PageTitle
                    eyebrow="ADMINISTRATION"
                    title="Admin Settings"
                    description="Configure dashboard preferences."
                    count="3"
                    countLabel="Settings"
                  />


                  <div className="dashboard-card">

                    <CardHeader
                      eyebrow="DASHBOARD"
                      title="Preferences"
                    />


                    <SettingRow
                      icon="bi bi-arrow-repeat"
                      title="Automatic Refresh"
                      description="Refresh dashboard data every 30 seconds."
                      checked={
                        settings.autoRefresh
                      }
                      onChange={
                        value =>
                          updateSetting(
                            "autoRefresh",
                            value
                          )
                      }
                    />


                    <SettingRow
                      icon="bi bi-bell-fill"
                      title="Notifications"
                      description="Show dashboard alerts and important admin notifications."
                      checked={
                        settings.showNotifications
                      }
                      onChange={
                        value =>
                          updateSetting(
                            "showNotifications",
                            value
                          )
                      }
                    />


                    <SettingRow
                      icon="bi bi-layout-text-window"
                      title="Compact Mode"
                      description="Save the preference for a compact admin dashboard."
                      checked={
                        settings.compactMode
                      }
                      onChange={
                        value =>
                          updateSetting(
                            "compactMode",
                            value
                          )
                      }
                    />

                  </div>


                  <div className="dashboard-card">

                    <CardHeader
                      eyebrow="SYSTEM"
                      title="Admin Account"
                    />

                    <div className="person-contact">

                      <div>

                        <i className="bi bi-person-fill" />

                        <span>
                          {user.name ||
                            user.username ||
                            "Administrator"}
                        </span>

                      </div>


                      <div>

                        <i className="bi bi-envelope-fill" />

                        <span>
                          {user.email ||
                            "Admin account"}
                        </span>

                      </div>


                      <div>

                        <i className="bi bi-shield-check" />

                        <span>
                          Administrator access
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              )}

          </>

        )}

      </main>
      {/* =========================================================
    DELETE SERVICE CONFIRMATION MODAL
========================================================= */}

      {deleteServiceTarget && (
        <div
          className="service-modal-overlay"
          onClick={() => {
            if (!serviceDeleteLoading) {
              setDeleteServiceTarget(null);
            }
          }}
        >
          <div
            className="delete-modal"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >

            {/* DELETE ICON */}

            <div className="delete-icon">
              <i className="fa-solid fa-trash"></i>
            </div>


            {/* LABEL */}

            <div className="modal-label">
              DELETE SERVICE
            </div>


            {/* TITLE */}

            <h2>
              Delete {deleteServiceTarget.name}?
            </h2>


            {/* DESCRIPTION */}

            <p>
              Are you sure you want to delete this service?
              This action cannot be undone.
            </p>


            {/* WARNING */}

            <div className="delete-warning">
              <i className="fa-solid fa-triangle-exclamation"></i>

              <span>
                Deleting this service may affect related
                bookings and service options.
              </span>
            </div>


            {/* ACTION BUTTONS */}

            <div className="modal-actions">

              <button
                type="button"
                className="cancel-btn"
                disabled={Boolean(serviceDeleteLoading)}
                onClick={() => {
                  setDeleteServiceTarget(null);
                }}
              >
                Cancel
              </button>


              <button
                type="button"
                className="confirm-delete-btn"
                disabled={Boolean(serviceDeleteLoading)}
                onClick={confirmDeleteService}
              >

                {serviceDeleteLoading ? (
                  <>
                    <span className="small-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash"></i>
                    Delete
                  </>
                )}

              </button>

            </div>

          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div
          className="hc-admin-logout-overlay"
          onClick={cancelLogout}
        >
          <div
            className="hc-admin-logout-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hc-admin-logout-icon">
              🚪
            </div>

            <h2 className="hc-admin-logout-title">
              Logout?
            </h2>

            <p className="hc-admin-logout-message">
              Are you sure you want to logout from your
              HiveCare Admin account?
            </p>

            <div className="hc-admin-logout-buttons">
              <button
                type="button"
                className="hc-admin-logout-button hc-admin-logout-cancel"
                onClick={cancelLogout}
              >
                Cancel
              </button>

              <button
                type="button"
                className="hc-admin-logout-button hc-admin-logout-confirm"
                onClick={confirmLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteModal && (

        <div
          className="modal-backdrop"
          onClick={
            closeDeleteModal
          }
        >

          <div
            className="delete-modal"
            onClick={
              e =>
                e.stopPropagation()
            }
          >

            <div className="delete-icon">

              <i className="bi bi-trash3-fill" />

            </div>

            <span className="modal-label">
              DELETE BOOKING
            </span>

            <h2>
              Delete booking #
              {
                selectedBookingId
              }?
            </h2>

            <p>
              This booking will be permanently removed from the database.
            </p>

            <div className="delete-warning">

              <i className="bi bi-exclamation-triangle-fill" />

              <span>
                This action cannot be undone.
              </span>

            </div>

            <div className="modal-actions">

              <button
                className="cancel-btn"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  deleteLoading
                }
              >
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={
                  handleDeleteBooking
                }
                disabled={
                  deleteLoading
                }
              >

                {deleteLoading ? (
                  <>
                    <span className="small-spinner" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash3-fill" />
                    Delete Booking
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      )}
      {editServiceModal && editingService && (
        <div
          className="service-modal-overlay"
          onClick={() =>
            !serviceEditLoading &&
            setEditServiceModal(false)
          }
        >
          <div
            className="service-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =====================================================
          HEADER
      ===================================================== */}

            <div className="service-modal-header">

              <div>
                <h3>Edit Service</h3>

                <p>
                  Update service details, pricing and options.
                </p>
              </div>

              <button
                className="service-modal-close"
                type="button"
                disabled={serviceEditLoading}
                onClick={() =>
                  setEditServiceModal(false)
                }
              >
                ×
              </button>

            </div>


            {/* =====================================================
          FORM
      ===================================================== */}

            <form onSubmit={handleUpdateService}>

              <div className="service-modal-body">


                {/* =================================================
              SERVICE TYPE
          ================================================= */}

                <div className="service-form-group">

                  <label>
                    Service Type
                  </label>

                  <select
                    value={
                      editingService.serviceType || ""
                    }
                    onChange={async (e) => {

                      const selectedType =
                        e.target.value;

                      let options = [];

                      try {

                        if (
                          selectedType
                            .trim()
                            .toLowerCase() === "tutor"
                        ) {

                          const response =
                            await getTutorSubjects();

                          options =
                            Array.isArray(response?.data)
                              ? response.data
                              : [];

                        } else if (
                          selectedType
                            .trim()
                            .toLowerCase() === "beautician" ||
                          selectedType
                            .trim()
                            .toLowerCase() === "house cleaning" ||
                          selectedType
                            .trim()
                            .toLowerCase() === "appliance repair"
                        ) {

                          const response =
                            await getServiceOptions(
                              selectedType
                            );

                          options =
                            Array.isArray(response?.data)
                              ? response.data
                              : [];
                        }

                        setEditingService(previous => ({
                          ...previous,

                          serviceType:
                            selectedType,

                          options: options.map(option => ({
                            id: option.id,
                            name: option.name || "",
                            price:
                              option.price ?? ""
                          })),

                          originalOptions:
                            options.map(option => ({
                              id: option.id,
                              name: option.name || "",
                              price:
                                option.price ?? ""
                            })),

                          newOptions: []
                        }));

                      } catch (error) {

                        console.error(
                          "Unable to load service options:",
                          error
                        );

                        showToast(
                          "Unable to load service options.",
                          "error"
                        );
                      }
                    }}
                  >

                    <option value="">
                      Select service type
                    </option>

                    {services.map(service => (
                      <option
                        key={service.id}
                        value={service.name}
                      >
                        {service.name}
                      </option>
                    ))}

                  </select>

                </div>


                {/* =================================================
              SERVICE NAME
          ================================================= */}

                <div className="service-form-group">

                  <label>
                    Service Name
                  </label>

                  <input
                    value={
                      editingService.name || ""
                    }
                    onChange={(e) =>
                      setEditingService(previous => ({
                        ...previous,
                        name: e.target.value
                      }))
                    }
                    required
                  />

                </div>


                {/* =================================================
              DESCRIPTION
          ================================================= */}

                <div className="service-form-group">

                  <label>
                    Description
                  </label>

                  <textarea
                    value={
                      editingService.description || ""
                    }
                    onChange={(e) =>
                      setEditingService(previous => ({
                        ...previous,
                        description: e.target.value
                      }))
                    }
                  />

                </div>


                {/* =================================================
              MAIN SERVICE PRICE
          ================================================= */}

                <div className="service-form-group">

                  <label>
                    Service Price
                  </label>

                  <div className="service-price-wrapper">

                    <span className="service-price-symbol">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        editingService.price ?? ""
                      }
                      onChange={(e) =>
                        setEditingService(previous => ({
                          ...previous,
                          price: e.target.value
                        }))
                      }
                      required
                    />

                  </div>

                </div>


                {/* =================================================
              SERVICE OPTIONS / TUTOR SUBJECTS
          ================================================= */}

                {(editingService.options?.length > 0 ||
                  editingService.newOptions?.length > 0) && (

                    <div className="service-form-group">

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px"
                        }}
                      >

                        <label
                          style={{
                            marginBottom: 0
                          }}
                        >
                          {editingService.serviceType
                            ?.trim()
                            .toLowerCase() === "tutor"
                            ? "Tutor Subjects"
                            : "Service Options"}
                        </label>

                        <button
                          type="button"
                          className="service-add-option-btn"
                          onClick={handleAddOption}
                          disabled={serviceEditLoading}
                        >
                          <i className="bi bi-plus-lg" />
                          Add Subject
                        </button>

                      </div>


                      {/* =================================================
                  EXISTING OPTIONS
              ================================================= */}

                      <div
                        className="service-options-editor"
                      >

                        {editingService.options?.map(
                          (option, index) => (

                            <div
                              className="service-option-edit-row"
                              key={
                                option.id ||
                                `existing-${index}`
                              }
                            >

                              <input
                                type="text"
                                value={
                                  option.name || ""
                                }
                                placeholder="Subject / option name"
                                onChange={(e) =>
                                  handleEditOptionChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                disabled={
                                  serviceEditLoading
                                }
                              />

                              <div
                                className="service-option-price"
                              >

                                <span>₹</span>

                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={
                                    option.price ?? ""
                                  }
                                  placeholder="Price"
                                  onChange={(e) =>
                                    handleEditOptionChange(
                                      index,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    serviceEditLoading
                                  }
                                />

                              </div>

                              <button
                                type="button"
                                className="service-delete-option-btn"
                                onClick={() =>
                                  handleRemoveOption(
                                    index
                                  )
                                }
                                disabled={
                                  serviceEditLoading
                                }
                                title="Remove option"
                              >
                                <i className="bi bi-trash3-fill" />
                              </button>

                            </div>

                          )
                        )}


                        {/* =================================================
                    NEW OPTIONS
                ================================================= */}

                        {editingService.newOptions?.map(
                          (option, index) => (

                            <div
                              className="service-option-edit-row new-option"
                              key={`new-${index}`}
                            >

                              <input
                                type="text"
                                value={
                                  option.name || ""
                                }
                                placeholder="New subject / option name"
                                onChange={(e) =>
                                  handleNewOptionChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                disabled={
                                  serviceEditLoading
                                }
                              />

                              <div
                                className="service-option-price"
                              >

                                <span>₹</span>

                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={
                                    option.price ?? ""
                                  }
                                  placeholder="Price"
                                  onChange={(e) =>
                                    handleNewOptionChange(
                                      index,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    serviceEditLoading
                                  }
                                />

                              </div>

                              <button
                                type="button"
                                className="service-delete-option-btn"
                                onClick={() =>
                                  handleRemoveNewOption(
                                    index
                                  )
                                }
                                disabled={
                                  serviceEditLoading
                                }
                                title="Remove new option"
                              >
                                <i className="bi bi-trash3-fill" />
                              </button>

                            </div>

                          )
                        )}

                      </div>

                    </div>
                  )}


                {/* =================================================
              ADD FIRST OPTION
          ================================================= */}

                {editingService.options?.length === 0 &&
                  editingService.newOptions?.length === 0 && (

                    <div
                      className="service-form-group"
                    >

                      <button
                        type="button"
                        className="service-add-option-btn"
                        onClick={handleAddOption}
                        disabled={serviceEditLoading}
                      >
                        <i className="bi bi-plus-lg" />
                        Add Subject / Service Option
                      </button>

                    </div>
                  )}

              </div>


              {/* =====================================================
            FOOTER
        ===================================================== */}

              <div className="service-modal-footer">

                <button
                  type="button"
                  className="service-modal-cancel"
                  disabled={serviceEditLoading}
                  onClick={() =>
                    setEditServiceModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-worker-btn"
                  disabled={serviceEditLoading}
                >

                  {serviceEditLoading ? (
                    <>
                      <span className="small-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg" />
                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        </div>
      )}
      {/* =====================================================
          RECEIPT MODAL
      ===================================================== */}

      {receiptModal && (

        <div
          className="modal-backdrop"
          onClick={
            closeReceipt
          }
        >

          <div
            className="receipt-modal"
            onClick={
              e =>
                e.stopPropagation()
            }
          >

            <div className="receipt-header">

              <div>

                <span>
                  HIVECARE
                </span>

                <h2>
                  Payment Receipt
                </h2>

              </div>

              <button
                onClick={
                  closeReceipt
                }
              >

                <i className="bi bi-x-lg" />

              </button>

            </div>


            {receiptLoading ? (

              <div className="empty-state">

                <div className="loading-spinner" />

                <h3>
                  Loading receipt...
                </h3>

              </div>

            ) : receipt ? (

              <>

                <div className="receipt-success">

                  <i className="bi bi-check-circle-fill" />

                  <div>

                    <strong>
                      Payment Successful
                    </strong>

                    <span>
                      HiveCare service payment
                    </span>

                  </div>

                </div>


                <div className="receipt-details">

                  <ReceiptRow
                    label="Booking ID"
                    value={
                      receipt.bookingId
                    }
                  />

                  <ReceiptRow
                    label="Customer"
                    value={
                      receipt.customerName
                    }
                  />

                  <ReceiptRow
                    label="Service"
                    value={
                      receipt.service
                    }
                  />

                  <ReceiptRow
                    label="Amount"
                    value={
                      "₹" +
                      (
                        receipt.amount ??
                        0
                      )
                    }
                  />

                  <ReceiptRow
                    label="Payment Status"
                    value={
                      receipt.paymentStatus ||
                      "PAID"
                    }
                  />

                  <ReceiptRow
                    label="Payment ID"
                    value={
                      receipt.razorpayPaymentId ||
                      "N/A"
                    }
                  />

                  <ReceiptRow
                    label="Paid At"
                    value={
                      receipt.paidAt ||
                      "N/A"
                    }
                  />

                </div>


                <div className="receipt-actions">

                  <button
                    className="download-btn"
                    onClick={() =>
                      downloadReceiptPDF(
                        receipt.bookingId
                      )
                    }
                  >

                    <i className="bi bi-file-earmark-pdf-fill" />

                    Download PDF

                  </button>


                  <button
                    className="receipt-close-btn"
                    onClick={
                      closeReceipt
                    }
                  >
                    Close
                  </button>

                </div>

              </>

            ) : (

              <EmptyState />

            )}

          </div>

        </div>

      )}


      {/* =====================================================
          BOOKING DETAILS MODAL
      ===================================================== */}

      {bookingDetailsModal &&
        selectedBooking && (

          <div
            className="modal-backdrop"
            onClick={
              closeBookingDetails
            }
          >

            <div
              className="receipt-modal"
              onClick={
                e =>
                  e.stopPropagation()
              }
            >

              <div className="receipt-header">

                <div>

                  <span>
                    BOOKING #
                    {
                      selectedBooking.id
                    }
                  </span>

                  <h2>
                    Booking Details
                  </h2>

                </div>

                <button
                  onClick={
                    closeBookingDetails
                  }
                >
                  <i className="bi bi-x-lg" />
                </button>

              </div>


              <div className="receipt-details">

                <ReceiptRow
                  label="Customer"
                  value={
                    selectedBooking.name
                  }
                />

                <ReceiptRow
                  label="User ID"
                  value={
                    selectedBooking.userId
                  }
                />

                <ReceiptRow
                  label="Service"
                  value={
                    selectedBooking.service
                  }
                />

                <ReceiptRow
                  label="Address"
                  value={
                    selectedBooking.address
                  }
                />

                <ReceiptRow
                  label="Date"
                  value={
                    formatDate(
                      selectedBooking.date ||
                      selectedBooking.scheduledAt
                    )
                  }
                />

                <ReceiptRow
                  label="Worker"
                  value={
                    getWorkerName(
                      selectedBooking
                    )
                  }
                />

                <ReceiptRow
                  label="Amount"
                  value={
                    "₹" +
                    (
                      selectedBooking.amount ??
                      0
                    )
                  }
                />

                <ReceiptRow
                  label="Status"
                  value={
                    getStatus(
                      selectedBooking
                    )
                  }
                />

                <ReceiptRow
                  label="Payment"
                  value={
                    getPaymentStatus(
                      selectedBooking
                    )
                  }
                />

                <ReceiptRow
                  label="Payment Timing"
                  value={
                    selectedBooking.paymentTiming ||
                    "N/A"
                  }
                />

                <ReceiptRow
                  label="Payment Method"
                  value={
                    selectedBooking.paymentMethod ||
                    "N/A"
                  }
                />

                <ReceiptRow
                  label="Problem"
                  value={
                    selectedBooking.problemDescription ||
                    selectedBooking.problem ||
                    "N/A"
                  }
                />

              </div>


              <div className="receipt-actions">

                <button
                  className="download-btn"
                  onClick={() =>
                    openAssignment(
                      selectedBooking
                    )
                  }
                >

                  <i className="bi bi-person-plus-fill" />

                  Assign Worker

                </button>


                <button
                  className="receipt-close-btn"
                  onClick={
                    closeBookingDetails
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}


      {/* =====================================================
          ASSIGN WORKER MODAL
      ===================================================== */}

      {assignmentBooking && (

        <div
          className="modal-backdrop"
          onClick={
            closeAssignment
          }
        >

          <div
            className="create-worker-modal"
            onClick={
              e =>
                e.stopPropagation()
            }
          >

            <div className="create-worker-header">

              <div>

                <span>
                  BOOKING #
                  {
                    assignmentBooking.id
                  }
                </span>

                <h2>
                  Assign Worker
                </h2>

                <p>
                  Select a HiveCare worker for this booking.
                </p>

              </div>

              <button
                onClick={
                  closeAssignment
                }
              >
                <i className="bi bi-x-lg" />
              </button>

            </div>


            <div className="create-worker-form">

              <div className="worker-form-group">

                <label>
                  Worker
                </label>

                <div className="worker-input">

                  <i className="bi bi-person-workspace" />

                  <select
                    value={
                      assignmentWorker
                    }
                    onChange={
                      e =>
                        setAssignmentWorker(
                          e.target.value
                        )
                    }
                  >

                    <option value="">
                      Select Worker
                    </option>

                    {workers
                      .filter(
                        worker =>
                          !worker.blocked
                      )
                      .map(
                        worker => (

                          <option
                            key={
                              worker.id
                            }
                            value={
                              worker.id
                            }
                          >

                            {
                              worker.name
                            }{" "}
                            —{" "}
                            {
                              worker.workerService ||
                              "Worker"
                            }

                          </option>

                        )
                      )}

                  </select>

                </div>

              </div>


              <div className="create-worker-actions">

                <button
                  className="create-worker-cancel"
                  onClick={
                    closeAssignment
                  }
                >
                  Cancel
                </button>

                <button
                  className="create-worker-submit"
                  onClick={
                    handleLocalAssignment
                  }
                >

                  <i className="bi bi-person-check-fill" />

                  Assign Worker

                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          CUSTOMER DETAILS
      ===================================================== */}

      {customerDetailsModal &&
        selectedCustomer && (

          <div
            className="modal-backdrop"
            onClick={() =>
              setCustomerDetailsModal(
                false
              )
            }
          >

            <div
              className="receipt-modal"
              onClick={
                e =>
                  e.stopPropagation()
              }
            >

              <div className="receipt-header">

                <div>

                  <span>
                    CUSTOMER PROFILE
                  </span>

                  <h2>
                    {
                      selectedCustomer.name ||
                      "Customer"
                    }
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setCustomerDetailsModal(
                      false
                    )
                  }
                >

                  <i className="bi bi-x-lg" />

                </button>

              </div>


              <div className="receipt-details">

                <ReceiptRow
                  label="User ID"
                  value={
                    selectedCustomer.id
                  }
                />

                <ReceiptRow
                  label="Name"
                  value={
                    selectedCustomer.name
                  }
                />

                <ReceiptRow
                  label="Email"
                  value={
                    selectedCustomer.email
                  }
                />

                <ReceiptRow
                  label="Phone"
                  value={
                    selectedCustomer.phone
                  }
                />

                <ReceiptRow
                  label="Address"
                  value={
                    selectedCustomer.address
                  }
                />

                <ReceiptRow
                  label="Bookings"
                  value={
                    customerBookings(
                      selectedCustomer
                    ).length
                  }
                />

              </div>


              <div className="receipt-actions">

                <button
                  className="download-btn"
                  onClick={() => {

                    setActiveSection(
                      "bookings"
                    );

                    setBookingSearch(
                      String(
                        selectedCustomer.id
                      )
                    );

                    setCustomerDetailsModal(
                      false
                    );

                  }}
                >

                  View Bookings

                </button>


                <button
                  className="receipt-close-btn"
                  onClick={() =>
                    setCustomerDetailsModal(
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


      {/* =====================================================
          WORKER DETAILS
      ===================================================== */}

      {workerDetailsModal &&
        selectedWorker && (

          <div
            className="modal-backdrop"
            onClick={() =>
              setWorkerDetailsModal(
                false
              )
            }
          >

            <div
              className="receipt-modal"
              onClick={
                e =>
                  e.stopPropagation()
              }
            >

              <div className="receipt-header">

                <div>

                  <span>
                    WORKER PROFILE
                  </span>

                  <h2>
                    {
                      selectedWorker.name ||
                      "Worker"
                    }
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setWorkerDetailsModal(
                      false
                    )
                  }
                >

                  <i className="bi bi-x-lg" />

                </button>

              </div>


              <div className="receipt-details">

                <ReceiptRow
                  label="Worker ID"
                  value={
                    selectedWorker.id
                  }
                />

                <ReceiptRow
                  label="Name"
                  value={
                    selectedWorker.name
                  }
                />

                <ReceiptRow
                  label="Email"
                  value={
                    selectedWorker.email
                  }
                />

                <ReceiptRow
                  label="Phone"
                  value={
                    selectedWorker.phone
                  }
                />

                <ReceiptRow
                  label="Service"
                  value={
                    selectedWorker.workerService
                  }
                />

                <ReceiptRow
                  label="Availability"
                  value={
                    selectedWorker.available
                      ? "ONLINE"
                      : "OFFLINE"
                  }
                />

                <ReceiptRow
                  label="Completed"
                  value={
                    getWorkerStats(
                      selectedWorker
                    ).completed
                  }
                />

                <ReceiptRow
                  label="Pending"
                  value={
                    getWorkerStats(
                      selectedWorker
                    ).pending
                  }
                />

                <ReceiptRow
                  label="Rejected"
                  value={
                    getWorkerStats(
                      selectedWorker
                    ).rejected
                  }
                />

              </div>


              <div className="receipt-actions">

                <button
                  className="download-btn"
                  onClick={() => {

                    setActiveSection(
                      "bookings"
                    );

                    setBookingSearch(
                      selectedWorker.name ||
                      ""
                    );

                    setWorkerDetailsModal(
                      false
                    );

                  }}
                >

                  View Bookings

                </button>


                <button
                  className="receipt-close-btn"
                  onClick={() =>
                    setWorkerDetailsModal(
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


      {/* =====================================================
          CREATE WORKER
      ===================================================== */}

      {createWorkerModal && (

        <div
          className="modal-backdrop"
          onClick={() =>
            !workerCreateLoading &&
            setCreateWorkerModal(
              false
            )
          }
        >

          <div
            className="create-worker-modal"
            onClick={
              e =>
                e.stopPropagation()
            }
          >

            <div className="create-worker-header">

              <div>

                <span>
                  WORKFORCE
                </span>

                <h2>
                  Create Worker
                </h2>

                <p>
                  Add a new HiveCare service professional.
                </p>

              </div>

              <button
                disabled={
                  workerCreateLoading
                }
                onClick={() =>
                  setCreateWorkerModal(
                    false
                  )
                }
              >

                <i className="bi bi-x-lg" />

              </button>

            </div>


            <form
              className="create-worker-form"
              onSubmit={
                handleCreateWorker
              }
            >

              <WorkerInput
                icon="bi bi-person-fill"
                label="Worker Name"
                value={
                  newWorker.name
                }
                onChange={
                  value =>
                    setNewWorker(
                      previous => ({
                        ...previous,
                        name:
                          value
                      })
                    )
                }
                placeholder="Enter worker name"
              />


              <WorkerInput
                icon="bi bi-envelope-fill"
                label="Email"
                type="email"
                value={
                  newWorker.email
                }
                onChange={
                  value =>
                    setNewWorker(
                      previous => ({
                        ...previous,
                        email:
                          value
                      })
                    )
                }
                placeholder="worker@example.com"
              />


              <WorkerInput
                icon="bi bi-telephone-fill"
                label="Phone"
                value={
                  newWorker.phone
                }
                onChange={
                  value =>
                    setNewWorker(
                      previous => ({
                        ...previous,
                        phone:
                          value
                      })
                    )
                }
                placeholder="Enter phone number"
              />

              <WorkerInput
                icon="bi bi-geo-alt-fill"
                label="Address"
                value={newWorker.address}
                onChange={(value) =>
                  setNewWorker((previous) => ({
                    ...previous,
                    address: value
                  }))
                }
                placeholder="Enter worker address"
              />
              <WorkerInput
                icon="bi bi-lock-fill"
                label="Password"
                type="password"
                value={
                  newWorker.password
                }
                onChange={
                  value =>
                    setNewWorker(
                      previous => ({
                        ...previous,
                        password:
                          value
                      })
                    )
                }
                placeholder="Create password"
              />


              <div className="worker-form-group">

                <label>
                  Service
                </label>

                <div className="worker-input">

                  <i className="bi bi-tools" />

                  <select
                    value={
                      newWorker.workerService
                    }
                    onChange={
                      e =>
                        setNewWorker(
                          previous => ({
                            ...previous,
                            workerService:
                              e.target.value
                          })
                        )
                    }
                  >

                    <option value="">
                      Select Service
                    </option>

                    {services.map(
                      service => (

                        <option
                          key={
                            service.id
                          }
                          value={
                            service.name
                          }
                        >

                          {
                            service.name
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>


              <div className="create-worker-actions">

                <button
                  type="button"
                  className="create-worker-cancel"
                  disabled={
                    workerCreateLoading
                  }
                  onClick={() =>
                    setCreateWorkerModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-worker-submit"
                  disabled={
                    workerCreateLoading
                  }
                >

                  {workerCreateLoading ? (
                    <>
                      <span className="small-spinner" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus-fill" />
                      Create Worker
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================================
          CREATE SERVICE
      ===================================================== */}

      {createServiceModal && (

        <div
          className="service-modal-overlay"
          onClick={() =>
            !serviceCreateLoading &&
            setCreateServiceModal(
              false
            )
          }
        >

          <div
            className="service-modal"
            onClick={
              e =>
                e.stopPropagation()
            }
          >

            <div className="service-modal-header">

              <div>

                <h3>
                  Create Service
                </h3>

                <p>
                  Add a new HiveCare service.
                </p>

              </div>

              <button
                className="service-modal-close"
                onClick={() =>
                  setCreateServiceModal(
                    false
                  )
                }
              >

                ×

              </button>

            </div>


            <form
              onSubmit={
                handleCreateService
              }
            >

              <div className="service-modal-body">


                <div className="service-form-group">

                  <label>
                    Service Name
                  </label>

                  <input
                    value={
                      newService.name
                    }
                    onChange={
                      e =>
                        setNewService(
                          previous => ({
                            ...previous,
                            name:
                              e.target.value
                          })
                        )
                    }
                    placeholder="e.g. Home Cleaning"
                  />

                </div>


                <div className="service-form-group">

                  <label>
                    Description
                  </label>

                  <textarea
                    value={
                      newService.description
                    }
                    onChange={
                      e =>
                        setNewService(
                          previous => ({
                            ...previous,
                            description:
                              e.target.value
                          })
                        )
                    }
                    placeholder="Describe this service..."
                  />

                </div>


                <div className="service-form-group">

                  <label>
                    Starting Price
                  </label>

                  <div className="service-price-wrapper">

                    <span className="service-price-symbol">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        newService.price
                      }
                      onChange={
                        e =>
                          setNewService(
                            previous => ({
                              ...previous,
                              price:
                                e.target.value
                            })
                          )
                      }
                      placeholder="0"
                    />

                  </div>

                </div>

              </div>


              <div className="service-modal-footer">

                <button
                  type="button"
                  className="service-modal-cancel"
                  disabled={
                    serviceCreateLoading
                  }
                  onClick={() =>
                    setCreateServiceModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="service-modal-submit"
                  disabled={
                    serviceCreateLoading
                  }
                >

                  {serviceCreateLoading
                    ? "Creating..."
                    : "Create Service"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  className
}) {

  return (

    <div
      className={
        "stat-card " +
        className
      }
    >

      <div className="stat-card-icon">

        <i className={icon} />

      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

      <i className="bi bi-arrow-up-right stat-arrow" />

    </div>

  );

}


/* =========================================================
   CARD HEADER
========================================================= */

function CardHeader({
  eyebrow,
  title,
  action,
  onAction
}) {

  return (

    <div className="card-header">

      <div>

        <span>
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

      </div>

      {action && (

        <button
          onClick={
            onAction
          }
        >

          {action}

          <i className="bi bi-arrow-right" />

        </button>

      )}

    </div>

  );

}


/* =========================================================
   OVERVIEW
========================================================= */

function ClickableOverviewBox({
  icon,
  label,
  value,
  className,
  onClick
}) {

  return (

    <button
      type="button"
      className={
        "overview-box " +
        className
      }
      onClick={
        onClick
      }
      style={{
        border:
          "none",
        textAlign:
          "left",
        cursor:
          "pointer",
        width:
          "100%"
      }}
    >

      <div className="overview-icon">

        <i className={icon} />

      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </button>

  );

}


function OverviewBox({
  icon,
  label,
  value,
  className
}) {

  return (

    <div
      className={
        "overview-box " +
        className
      }
    >

      <div className="overview-icon">

        <i className={icon} />

      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>

  );

}


/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status
}) {

  const value =
    String(
      status ||
      "PENDING"
    ).toUpperCase();

  return (

    <span
      className={
        "status-pill " +
        value.toLowerCase()
      }
    >

      <i className="bi bi-circle-fill" />

      {value}

    </span>

  );

}


/* =========================================================
   SERVICE CARD
========================================================= */
function ServiceCard({
  service,
  index,
  getServiceIcon,
  displayPrice,
  large,
  openEditService,
  handleDeleteService,
  serviceDeleteLoading
}) {
  const name =
    service?.name ||
    service?.service ||
    "Service";

  const price =
    displayPrice !== undefined
      ? displayPrice
      : (
        service?.price ??
        service?.amount ??
        0
      );

  return (
    <div
      className={
        large
          ? "service-card large"
          : "service-card"
      }
    >

      <div className="service-card-top">

        <div className="service-icon">
          <i className={getServiceIcon(name)} />
        </div>

      </div>

      <span className="service-label">
        PROFESSIONAL SERVICE
      </span>

      <h3>
        {name}
      </h3>

      <p>
        {service?.description ||
          "Trusted HiveCare professionals."}
      </p>

      <div className="service-bottom">

        <div>
          <span>
            STARTING FROM
          </span>

          <strong>
            ₹{Number(price || 0).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="service-price-arrow">
          <i className="bi bi-arrow-up-right" />
        </div>

      </div>

      {/* EDIT + DELETE */}

      <div className="service-card-actions">

        <button
          type="button"
          className="service-edit-btn"
          onClick={(e) => {
            e.stopPropagation();

            openEditService(service);
          }}
          title="Edit service"
          aria-label={`Edit ${name}`}
        >
          <i className="bi bi-pencil-fill" />
        </button>

        <button
          type="button"
          className="service-delete-btn"
          onClick={(e) => {
            e.stopPropagation();

            handleDeleteService(service);
          }}
          disabled={
            serviceDeleteLoading === service.id
          }
          title="Delete service"
          aria-label={`Delete ${name}`}
        >
          {serviceDeleteLoading === service.id ? (
            <i className="bi bi-hourglass-split" />
          ) : (
            <i className="bi bi-trash3-fill" />
          )}
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   PAGE TITLE
========================================================= */

function PageTitle({
  eyebrow,
  title,
  description,
  count,
  countLabel
}) {

  return (

    <div className="page-title">

      <div>

        <span>
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>

      </div>


      <div className="page-count">

        <strong>
          {count}
        </strong>

        <span>
          {countLabel}
        </span>

      </div>

    </div>

  );

}


/* =========================================================
   BOOKING TABLE
========================================================= */

function BookingTable({
  bookings,
  getWorkerName,
  formatDate,
  getStatus,
  getPaymentStatus,
  viewReceipt,
  downloadReceiptPDF,
  openDeleteModal,
  deleteLoading,
  openBookingDetails,
  openAssignment,
  paymentOnly
}) {

  return (

    <div className="booking-table-card">

      <div className="table-top">

        <div>

          <span>
            {paymentOnly
              ? "PAYMENT RECORDS"
              : "BOOKING RECORDS"}
          </span>

          <h2>
            {paymentOnly
              ? "Payment Transactions"
              : "Customer Bookings"}
          </h2>

        </div>

        <div className="table-total">
          {bookings.length}
        </div>

      </div>


      {bookings.length ===
        0 ? (

        <EmptyState />

      ) : (

        <div className="table-scroll">

          <table className="admin-booking-table">

            <colgroup>
              <col className="col-id" />
              <col className="col-customer" />
              <col className="col-service" />
              <col className="col-date" />
              <col className="col-worker" />
              <col className="col-amount" />
              <col className="col-status" />
              <col className="col-payment" />
              <col className="col-actions" />
            </colgroup>

            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Service
                </th>

                <th>
                  Date
                </th>

                <th>
                  Worker
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Status
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {bookings
                .slice()
                .sort(
                  (a, b) =>
                    Number(b.id || 0) -
                    Number(a.id || 0)
                )
                .map((booking) => {

                  const paymentStatus =
                    getPaymentStatus(
                      booking
                    );

                  return (

                    <tr
                      key={
                        booking.id
                      }
                    >

                      <td>

                        <span className="booking-id">
                          #
                          {
                            booking.id
                          }
                        </span>

                      </td>


                      <td>

                        <div className="customer-cell">

                          <div className="table-avatar">

                            <i className="bi bi-person-fill" />

                          </div>

                          <div>

                            <strong>
                              {
                                booking.name ||
                                "Customer"
                              }
                            </strong>

                            <span>
                              User ID:{" "}
                              {
                                booking.userId ||
                                "N/A"
                              }
                            </span>

                          </div>

                        </div>

                      </td>


                      <td>

                        <div className="service-cell">

                          <i className="service-table-icon bi bi-tools" />

                          <span>
                            {
                              booking.service ||
                              "Service"
                            }
                          </span>

                        </div>

                      </td>


                      <td>

                        <span className="date-cell">

                          <i className="bi bi-calendar3" />

                          {formatDate(
                            booking.date ||
                            booking.scheduledAt
                          )}

                        </span>

                      </td>


                      <td>

                        <div className="worker-cell">

                          <i className="bi bi-person-workspace" />

                          <span>
                            {
                              getWorkerName(
                                booking
                              )
                            }
                          </span>

                        </div>

                      </td>


                      <td>

                        <strong className="amount-cell">
                          ₹
                          {
                            booking.amount ??
                            0
                          }
                        </strong>

                      </td>


                      <td>

                        <StatusBadge
                          status={
                            booking.status
                          }
                        />

                      </td>


                      <td>

                        <span
                          className={
                            paymentStatus ===
                              "PAID"
                              ? "payment-pill paid"
                              : "payment-pill pending"
                          }
                        >

                          <i
                            className={
                              paymentStatus ===
                                "PAID"
                                ? "bi bi-check-circle-fill"
                                : "bi bi-clock-fill"
                            }
                          />

                          {
                            booking.paymentStatus ||
                            "PENDING"
                          }

                        </span>

                      </td>


                      <td>
                        <div
                          className="table-actions"
                          style={{
                            flexWrap: "wrap"
                          }}
                        >

                          {paymentOnly ? (
                            <>
                              {/* VIEW RECEIPT */}
                              <button
                                className="action-btn receipt"
                                title="View receipt"
                                disabled={paymentStatus !== "PAID"}
                                onClick={() =>
                                  viewReceipt(booking.id)
                                }
                              >
                                <i className="bi bi-receipt" />
                              </button>

                              {/* DOWNLOAD PDF */}
                              <button
                                className="action-btn pdf"
                                title="Download PDF"
                                disabled={paymentStatus !== "PAID"}
                                onClick={() =>
                                  downloadReceiptPDF(booking.id)
                                }
                              >
                                <i className="bi bi-file-earmark-pdf-fill" />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* VIEW BOOKING DETAILS */}
                              <button
                                className="action-btn receipt"
                                title="View details"
                                onClick={() =>
                                  openBookingDetails(booking)
                                }
                              >
                                <i className="bi bi-eye-fill" />
                              </button>

                              {/* ASSIGN WORKER */}
                              <button
                                className="action-btn"
                                title="Assign worker"
                                style={{
                                  background: "#edf5ff",
                                  color: "#1261d8"
                                }}
                                onClick={() =>
                                  openAssignment(booking)
                                }
                              >
                                <i className="bi bi-person-plus-fill" />
                              </button>

                              {/* VIEW RECEIPT */}
                              <button
                                className="action-btn receipt"
                                title="View receipt"
                                disabled={paymentStatus !== "PAID"}
                                onClick={() =>
                                  viewReceipt(booking.id)
                                }
                              >
                                <i className="bi bi-receipt" />
                              </button>

                              {/* DOWNLOAD PDF */}
                              <button
                                className="action-btn pdf"
                                title="Download PDF"
                                disabled={paymentStatus !== "PAID"}
                                onClick={() =>
                                  downloadReceiptPDF(booking.id)
                                }
                              >
                                <i className="bi bi-file-earmark-pdf-fill" />
                              </button>

                              {/* DELETE */}
                              <button
                                className="action-btn delete"
                                title="Delete booking"
                                disabled={deleteLoading}
                                onClick={() =>
                                  openDeleteModal(booking.id)
                                }
                              >
                                <i className="bi bi-trash3-fill" />
                              </button>
                            </>
                          )}

                        </div>
                      </td>

                    </tr>

                  );

                }
                )}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}


/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  label,
  onClick
}) {

  return (

    <button
      type="button"
      onClick={
        onClick
      }
      style={{
        minHeight:
          "80px",
        border:
          "1px solid #e1eaf6",
        background:
          "#f8fbff",
        borderRadius:
          "13px",
        cursor:
          "pointer",
        color:
          "#1261d8",
        fontWeight:
          700,
        display:
          "flex",
        flexDirection:
          "column",
        alignItems:
          "center",
        justifyContent:
          "center",
        gap:
          "8px"
      }}
    >

      <i
        className={icon}
        style={{
          fontSize:
            "20px"
        }}
      />

      {label}

    </button>

  );

}


/* =========================================================
   ANALYTICS BOX
========================================================= */

function AnalyticsBox({
  icon,
  label,
  value
}) {

  return (

    <div
      style={{
        padding:
          "18px",
        background:
          "#f7faff",
        border:
          "1px solid #e1eaf6",
        borderRadius:
          "14px"
      }}
    >

      <i
        className={icon}
        style={{
          color:
            "#1261d8",
          fontSize:
            "20px"
        }}
      />

      <span
        style={{
          display:
            "block",
          marginTop:
            "10px",
          color:
            "#7889a5",
          fontSize:
            "10px",
          fontWeight:
            700
        }}
      >
        {label}
      </span>

      <strong
        style={{
          display:
            "block",
          marginTop:
            "4px",
          color:
            "#172b4d",
          fontSize:
            "20px"
        }}
      >
        {value}
      </strong>

    </div>

  );

}


/* =========================================================
   WORKER INPUT
========================================================= */

function WorkerInput({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}) {

  return (

    <div className="worker-form-group">

      <label>
        {label}
      </label>

      <div className="worker-input">

        <i className={icon} />

        <input
          type={type}
          value={value}
          onChange={
            e =>
              onChange(
                e.target.value
              )
          }
          placeholder={
            placeholder
          }
        />

      </div>

    </div>

  );

}


/* =========================================================
   SETTING ROW
========================================================= */

function SettingRow({
  icon,
  title,
  description,
  checked,
  onChange
}) {

  return (

    <div
      style={{
        display:
          "flex",
        alignItems:
          "center",
        gap:
          "15px",
        padding:
          "17px 0",
        borderBottom:
          "1px solid #edf2f7"
      }}
    >

      <div
        style={{
          width:
            "42px",
          height:
            "42px",
          borderRadius:
            "12px",
          background:
            "#eaf3ff",
          color:
            "#1261d8",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center"
        }}
      >

        <i
          className={icon}
        />

      </div>


      <div
        style={{
          flex:
            1
        }}
      >

        <strong
          style={{
            display:
              "block",
            color:
              "#263b5b",
            fontSize:
              "13px"
          }}
        >
          {title}
        </strong>

        <span
          style={{
            display:
              "block",
            marginTop:
              "4px",
            color:
              "#8292a9",
            fontSize:
              "10px"
          }}
        >
          {description}
        </span>

      </div>


      <button
        type="button"
        onClick={() =>
          onChange(
            !checked
          )
        }
        style={{
          width:
            "52px",
          height:
            "29px",
          border:
            "none",
          borderRadius:
            "20px",
          background:
            checked
              ? "#1261d8"
              : "#dce5f2",
          cursor:
            "pointer",
          padding:
            "3px"
        }}
      >

        <span
          style={{
            display:
              "block",
            width:
              "23px",
            height:
              "23px",
            borderRadius:
              "50%",
            background:
              "#fff",
            transform:
              checked
                ? "translateX(23px)"
                : "translateX(0)",
            transition:
              ".2s"
          }}
        />

      </button>

    </div>

  );

}


/* =========================================================
   RECEIPT ROW
========================================================= */

function ReceiptRow({
  label,
  value
}) {

  return (

    <div className="receipt-row">

      <span>
        {label}
      </span>

      <strong>
        {value || "N/A"}
      </strong>

    </div>

  );

}


/* =========================================================
   EMPTY
========================================================= */

function EmptyState() {

  return (

    <div className="empty-state">

      <div>

        <i className="bi bi-inbox" />

      </div>

      <h3>
        No records found
      </h3>

      <p>
        There is currently no data to display.
      </p>

    </div>

  );

}


export default AdminDashboard;