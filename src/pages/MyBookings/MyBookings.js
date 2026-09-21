
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createBooking,
  updateBooking,
  getServices,
  getTutorSubjects,
  getServiceOptions
} from "../../api/api";

import {
  APIProvider,
  useMapsLibrary
} from "@vis.gl/react-google-maps";

import "./MyBookings.css";

// =====================================================
// GOOGLE MAPS API KEY
// =====================================================

const GOOGLE_MAPS_API_KEY =
  "AIzaSyAz4-kvt2eeQnN-l7ocOV9_StxWqF3tqaY";

// =====================================================
// LOCATION SEARCH COMPONENT
// =====================================================

function LocationSearch({ formData, setFormData }) {

  const places = useMapsLibrary("places");

  const [inputValue, setInputValue] = useState(
    formData.address || ""
  );

  const [suggestions, setSuggestions] = useState([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  useEffect(() => {

    if (!places) return;

    if (!inputValue.trim()) {

      setSuggestions([]);

      return;
    }

    const timeout = setTimeout(async () => {

      try {

        setSearchLoading(true);

        const request = {
          input: inputValue,
          includedRegionCodes: ["in"]
        };

        const { suggestions: results } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            request
          );

        setSuggestions(
          results?.slice(0, 5) || []
        );

      } catch (error) {

        console.error(
          "Google location search error:",
          error
        );

        setSuggestions([]);

      } finally {

        setSearchLoading(false);

      }

    }, 350);

    return () => clearTimeout(timeout);

  }, [inputValue, places]);


  // =====================================================
  // SELECT LOCATION
  // =====================================================

  const selectLocation = async (suggestion) => {

    try {

      const placePrediction =
        suggestion.placePrediction;

      if (!placePrediction) return;

      const place =
        placePrediction.toPlace();

      await place.fetchFields({
        fields: [
          "displayName",
          "formattedAddress",
          "location"
        ]
      });

      const selectedAddress =
        place.formattedAddress ||
        placePrediction.text?.text ||
        inputValue;

      const selectedLatitude =
        place.location?.lat();

      const selectedLongitude =
        place.location?.lng();

      setInputValue(selectedAddress);

      setSuggestions([]);

      setFormData((prev) => ({
        ...prev,
        address: selectedAddress,
        latitude: selectedLatitude,
        longitude: selectedLongitude
      }));

    } catch (error) {

      console.error(
        "Failed to select location:",
        error
      );

    }

  };


  return (
    <>

      {/* =================================================
          LOCATION INPUT
      ================================================= */}

      <div
        className="input-wrap"
        style={{
          position: "relative"
        }}
      >

        <i className="bi bi-geo-alt"></i>

        <input
          type="text"
          name="address"
          value={inputValue}
          onChange={(e) => {

            const value = e.target.value;

            setInputValue(value);

            setFormData((prev) => ({
              ...prev,
              address: value,

              // Clear old coordinates when
              // customer changes the address
              latitude: "",
              longitude: ""
            }));

          }}
          placeholder="Search your service location"
          autoComplete="off"
        />

        {/* SEARCH LOADING */}

        {searchLoading && (

          <span
            style={{
              position: "absolute",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)"
            }}
          >

            <i className="bi bi-arrow-repeat"></i>

          </span>

        )}


        {/* =================================================
            GOOGLE LOCATION SUGGESTIONS
        ================================================= */}

        {suggestions.length > 0 && (

          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "#fff",
              borderRadius: "10px",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.15)",
              zIndex: 9999,
              overflow: "hidden",
              border: "1px solid #e5e7eb"
            }}
          >

            {suggestions.map(
              (suggestion, index) => {

                const prediction =
                  suggestion.placePrediction;

                if (!prediction) return null;

                return (

                  <button
                    type="button"
                    key={
                      prediction.placeId ||
                      index
                    }
                    onClick={() =>
                      selectLocation(
                        suggestion
                      )
                    }
                    style={{
                      width: "100%",
                      border: "none",
                      background: "#fff",
                      padding: "13px 15px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      borderBottom:
                        "1px solid #f0f0f0"
                    }}
                  >

                    <i
                      className="bi bi-geo-alt-fill"
                      style={{
                        color: "#2563eb"
                      }}
                    ></i>

                    <span>

                      {prediction.text?.text ||
                        "Location"}

                    </span>

                  </button>

                );

              }
            )}

          </div>

        )}

      </div>


      {/* =================================================
          SELECTED LOCATION CONFIRMATION

          MAP REMOVED

          Latitude and longitude are STILL saved.
      ================================================= */}

      {formData.latitude &&
        formData.longitude && (

          <div
            style={{
              marginTop: "8px",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "12px",
              color: "#16a34a"
            }}
          >

            <i className="bi bi-check-circle-fill"></i>

            Exact location selected

          </div>

        )}

    </>
  );
}


// =====================================================
// MAIN COMPONENT
// =====================================================

function MyBookings() {

  const navigate = useNavigate();

  const location = useLocation();

  const { user, loading: authLoading } = useAuth();
  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({

    id: null,

    name: "",

    address: "",

    latitude: "",

    longitude: "",

    date: "",

    timeSlot: "",

    service:
      location.state?.service || "",

    course: "",

    paymentTiming: "",

    amount: "",

    userId: ""

  });


  // =====================================================
  // SERVICES
  // =====================================================

  const [services, setServices] =
    useState([]);


  // =====================================================
  // TUTOR SUBJECTS
  // KEEPING EXISTING STATE
  // =====================================================

  const [tutorSubjects, setTutorSubjects] =
    useState([]);


  const [subjectsLoading, setSubjectsLoading] =
    useState(false);


  // =====================================================
  // GENERIC SERVICE OPTIONS
  //
  // Used for:
  // Tutor
  // Beautician
  // House Cleaning
  // Appliance Repair
  //
  // Data comes from backend.
  // =====================================================

  const [serviceOptions, setServiceOptions] =
    useState([]);


  const [serviceOptionsLoading, setServiceOptionsLoading] =
    useState(false);


  // =====================================================
  // NOTIFICATION
  // =====================================================

  const [notification, setNotification] =
    useState({

      show: false,

      type: "info",

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


    setTimeout(() => {

      setNotification({

        show: false,

        type: "info",

        title: "",

        message: ""

      });

    }, 3500);

  };


  // =====================================================
  // CLOSE NOTIFICATION
  // =====================================================

  const closeNotification = () => {

    setNotification({

      show: false,

      type: "info",

      title: "",

      message: ""

    });

  };


  // =====================================================
  // LOAD SERVICES
  // =====================================================

  useEffect(() => {

    const loadServices = async () => {

      try {

        const response =
          await getServices();

        const data =
          Array.isArray(response.data)
            ? response.data
            : [];

        setServices(data);

      } catch (error) {

        console.error(
          "Failed to load services:",
          error
        );

        showNotification(
          "error",
          "Unable to Load Services",
          "Please refresh the page and try again."
        );

      }

    };

    loadServices();

  }, []);


  // =====================================================
  // LOAD TUTOR SUBJECTS
  //
  // EXISTING LOGIC KEPT
  // =====================================================

  useEffect(() => {

    const loadTutorSubjects = async () => {

      setSubjectsLoading(true);

      try {

        const response =
          await getTutorSubjects();

        const data =
          Array.isArray(response.data)
            ? response.data
            : [];

        // console.log(
        //   "TUTOR SUBJECTS:",
        //   data
        // );

        setTutorSubjects(data);

      } catch (error) {

        console.error(
          "Failed to load tutor subjects:",
          error
        );

        setTutorSubjects([]);

        showNotification(
          "error",
          "Subjects Unavailable",
          "Tutor subjects could not be loaded."
        );

      } finally {

        setSubjectsLoading(false);

      }

    };

    loadTutorSubjects();

  }, []);


  // =====================================================
  // LOAD OPTIONS FOR SELECTED SERVICE
  //
  // Backend:
  //
  // /api/subjects/service/{serviceName}
  //
  // This is the NEW logic.
  //
  // Existing Tutor endpoint is still kept above.
  // =====================================================

  useEffect(() => {

    const loadServiceOptions = async () => {

      const selectedService =
        formData.service?.trim();

      if (!selectedService) {

        setServiceOptions([]);

        return;

      }


      // =================================================
      // Only these services use backend options.
      //
      // Tutor already has its existing endpoint, so
      // Tutor continues using tutorSubjects.
      // =================================================

      const serviceName =
        selectedService.toLowerCase();


      if (
        serviceName !== "tutor" &&
        serviceName !== "beautician" &&
        serviceName !== "house cleaning" &&
        serviceName !== "appliance repair"
      ) {

        setServiceOptions([]);

        return;

      }


      // Tutor uses existing tutorSubjects.
      if (serviceName === "tutor") {

        return;

      }


      setServiceOptionsLoading(true);

      try {

        const response =
          await getServiceOptions(
            selectedService
          );

        const data =
          Array.isArray(response.data)
            ? response.data
            : [];

        // console.log(
        //   `${selectedService} OPTIONS:`,
        //   data
        // );

        setServiceOptions(data);

      } catch (error) {

        console.error(
          `Failed to load ${selectedService} options:`,
          error
        );

        setServiceOptions([]);

        showNotification(
          "error",
          "Options Unavailable",
          `${selectedService} options could not be loaded.`
        );

      } finally {

        setServiceOptionsLoading(false);

      }

    };

    loadServiceOptions();

  }, [formData.service]);


  // =====================================================
  // NORMAL SERVICES
  // =====================================================

  const normalServices =
    services.filter((service) => {

      if (!service?.name) return false;

      return (
        service.name
          .trim()
          .toLowerCase() !== "tutor"
      );

    });


  // =====================================================
  // TUTOR EXISTS
  // =====================================================

  const tutorExists =
    services.some(
      (service) =>
        service?.name
          ?.trim()
          .toLowerCase() === "tutor"
    );


  // =====================================================
  // FIND SERVICE
  // =====================================================

  const findService = (serviceName) => {

    if (!serviceName) return null;

    return services.find(
      (service) =>
        service?.name
          ?.trim()
          .toLowerCase() ===
        serviceName
          .trim()
          .toLowerCase()
    );

  };


  // =====================================================
  // FIND SUBJECT
  //
  // Existing Tutor functionality.
  // =====================================================

  const findSubject = (subjectName) => {

    if (!subjectName) return null;

    return tutorSubjects.find(
      (subject) =>
        subject?.name
          ?.trim()
          .toLowerCase() ===
        subjectName
          .trim()
          .toLowerCase()
    );

  };


  // =====================================================
  // FIND SERVICE OPTION
  //
  // Used for Beautician,
  // House Cleaning and Appliance Repair.
  // =====================================================

  const findServiceOption = (optionName) => {

    if (!optionName) return null;

    return serviceOptions.find(
      (option) =>
        option?.name
          ?.trim()
          .toLowerCase() ===
        optionName
          .trim()
          .toLowerCase()
    );

  };


  // =====================================================
  // SERVICE FROM SERVICES PAGE
  // =====================================================

  useEffect(() => {

    if (!location.state?.service) return;

    const selectedService =
      location.state.service;

    if (
      selectedService
        .trim()
        .toLowerCase() === "tutor"
    ) {

      setFormData((prev) => ({

        ...prev,

        service: "Tutor",

        course: "",

        amount: ""

      }));

      return;

    }


    const service =
      findService(selectedService);

    if (service) {

      setFormData((prev) => ({

        ...prev,

        service: service.name,

        course: "",

        amount:
          service.price ?? ""

      }));

    }

  }, [location.state, services]);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    // =================================================
    // SERVICE
    // =================================================

    if (name === "service") {

      if (
        value
          .trim()
          .toLowerCase() === "tutor"
      ) {

        setFormData((prev) => ({

          ...prev,

          service: "Tutor",

          course: "",

          amount: ""

        }));

        setServiceOptions([]);

        return;

      }


      const service =
        findService(value);

      setFormData((prev) => ({

        ...prev,

        service: value,

        course: "",

        amount:
          service?.price ?? ""

      }));

      return;

    }


    // =================================================
    // OPTION / SUBJECT
    //
    // We continue using the existing "course" field
    // so your booking functionality is NOT changed.
    // =================================================

    if (name === "course") {

      // -------------------------------------------------
      // TUTOR
      // -------------------------------------------------

      if (
        formData.service
          ?.trim()
          .toLowerCase() === "tutor"
      ) {

        const subject =
          findSubject(value);

        setFormData((prev) => ({

          ...prev,

          course: value,

          amount:
            subject?.price ?? ""

        }));

        return;

      }


      // -------------------------------------------------
      // OTHER OPTION-BASED SERVICES
      // -------------------------------------------------

      const option =
        findServiceOption(value);

      setFormData((prev) => ({

        ...prev,

        course: value,

        amount:
          option?.price ?? ""

      }));

      return;

    }


    // =================================================
    // OTHER FIELDS
    // =================================================

    setFormData((prev) => ({

      ...prev,

      [name]: value

    }));

  };


 const handleSubmit = async (e) => {

  e.preventDefault();

  // =====================================================
  // AUTHENTICATION CHECK
  // =====================================================

  if (authLoading) {
    return;
  }

  if (!user?.id) {
    showNotification(
      "warning",
      "Login Required",
      "Please login before booking a service."
    );

    setTimeout(() => {
      navigate("/login");
    }, 1800);

    return;
  }

  // =================================================
  // VALIDATION
  // =================================================

  if (
    !formData.service ||
    !formData.name.trim() ||
    !formData.address.trim() ||
    !formData.date ||
    !formData.timeSlot ||
    !formData.paymentTiming ||
    formData.amount === "" ||
    (
      formData.service.trim().toLowerCase() === "tutor" &&
      !formData.course
    )
  ) {

    showNotification(
      "warning",
      "Incomplete Information",
      "Please complete all required fields."
    );

    return;
  }
    if (!formData.timeSlot) {
  showNotification("Please select a time slot.", "error");
  return;
}
    // =================================================
    // LOCATION VALIDATION
    // =================================================

    if (

      !formData.latitude ||

      !formData.longitude

    ) {

      showNotification(
        "warning",
        "Select Your Location",
        "Please search and select your exact service location from the Google suggestions."
      );

      return;

    }


    // =================================================
    // BOOKING DATA
    // =================================================

    const bookingData = {

      ...formData,

      userId: user.id,

      amount:
        Number(formData.amount),

      latitude:
        Number(formData.latitude),

      longitude:
        Number(formData.longitude)

    };


    // // console.log(
    //   "BOOKING DATA:",
    //   bookingData
    // );


    try {

      // =================================================
      // UPDATE BOOKING
      // =================================================

      if (formData.id) {

        await updateBooking(
          formData.id,
          bookingData
        );

        showNotification(
          "success",
          "Booking Updated",
          "Your booking has been updated successfully."
        );

        return;

      }


      // =================================================
      // CREATE BOOKING
      // =================================================

      await createBooking(
        bookingData
      );


      showNotification(
        "success",
        "Booking Confirmed",
        "Your booking has been created successfully."
      );


      setTimeout(() => {

        navigate(
          "/history",
          {
            replace: true
          }
        );

      }, 1800);


    } catch (error) {

      console.error(
        "BOOKING ERROR:",
        error
      );


      let message =
        "Something went wrong while creating your booking.";


      if (error.response?.data) {

        if (
          typeof error.response.data ===
          "string"
        ) {

          message =
            error.response.data;

        } else if (
          error.response.data.message
        ) {

          message =
            error.response.data.message;

        }

      }


      showNotification(
        "error",
        "Booking Failed",
        message
      );

    }

  };


  // =====================================================
  // TUTOR CHECK
  // =====================================================

  const isTutor =
    formData.service
      ?.trim()
      .toLowerCase() === "tutor";


  // =====================================================
  // OPTION-BASED SERVICE CHECK
  // =====================================================

  const isBeautician =
    formData.service
      ?.trim()
      .toLowerCase() === "beautician";


  const isHouseCleaning =
    formData.service
      ?.trim()
      .toLowerCase() === "house cleaning";


  const isApplianceRepair =
    formData.service
      ?.trim()
      .toLowerCase() === "appliance repair";


  const hasServiceOptions =
    isTutor ||
    isBeautician ||
    isHouseCleaning ||
    isApplianceRepair;


  // =====================================================
  // CURRENT OPTIONS
  //
  // Tutor -> tutorSubjects
  // Others -> serviceOptions
  // =====================================================

  const currentOptions =
    isTutor
      ? tutorSubjects
      : serviceOptions;


  const currentOptionsLoading =
    isTutor
      ? subjectsLoading
      : serviceOptionsLoading;


  // =====================================================
  // OPTION LABEL
  // =====================================================

  const optionSectionTitle =
    isTutor
      ? "Choose your subject"
      : "Choose your option";


  const optionLabel =
    isTutor
      ? "Subject"
      : "Service Option";


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

    <div className="booking-page">


      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="booking-orb orb-one"></div>

      <div className="booking-orb orb-two"></div>

      <div className="booking-grid"></div>


      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification.show && (

        <div
          className={`booking-notification ${notification.type}`}
        >

          <div className="notification-icon">

            <i
              className={
                getNotificationIcon()
              }
            ></i>

          </div>


          <div className="notification-text">

            <strong>
              {notification.title}
            </strong>

            <span>
              {notification.message}
            </span>

          </div>


          <button
            type="button"
            onClick={
              closeNotification
            }
          >

            <i className="bi bi-x-lg"></i>

          </button>

        </div>

      )}


      {/* =================================================
          MAIN
      ================================================= */}

      <div className="booking-wrapper">


        {/* =================================================
            HERO
        ================================================= */}

        <div className="booking-hero">

          <div className="hero-badge">

            <i className="bi bi-stars"></i>

            HIVECARE SERVICES

          </div>


          <h1>

            Book Your

            <span>
              {" "}Perfect Service
            </span>

          </h1>


          <p>

            Choose a service, select your preferred
            date and let our professionals take care
            of the rest.

          </p>


          <div className="hero-features">

            <div>

              <i className="bi bi-shield-check"></i>

              <span>
                Trusted Professionals
              </span>

            </div>


            <div>

              <i className="bi bi-lightning-charge"></i>

              <span>
                Quick Booking
              </span>

            </div>


            <div>

              <i className="bi bi-headset"></i>

              <span>
                Reliable Support
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            BOOKING CARD
        ================================================= */}

        <div className="booking-layout">


          {/* =================================================
              LEFT
          ================================================= */}

          <div className="booking-info">

            <div className="info-icon">

              <i className="bi bi-calendar2-check"></i>

            </div>


            <h2>
              Make a Booking
            </h2>


            <p>

              Complete the details below to schedule
              your service.

            </p>


            <div className="booking-steps">

              <div className="booking-step active">

                <div>01</div>

                <span>
                  Choose your service
                </span>

              </div>


              <div className="step-line"></div>


              <div className="booking-step">

                <div>02</div>

                <span>
                  Enter your details
                </span>

              </div>


              <div className="step-line"></div>


              <div className="booking-step">

                <div>03</div>

                <span>
                  Confirm booking
                </span>

              </div>

            </div>


            <div className="info-card">

              <i className="bi bi-info-circle"></i>


              <div>

                <strong>
                  How it works
                </strong>


                <p>

                  Admin reviews your booking first.
                  Once accepted, you can proceed
                  with your selected payment option.

                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <div className="booking-form">

            <div className="form-heading">

              <div>

                <span>
                  BOOKING DETAILS
                </span>

                <h3>
                  Tell us what you need
                </h3>

              </div>


              <div className="secure-badge">

                <i className="bi bi-lock-fill"></i>

                Secure

              </div>

            </div>


            <form onSubmit={handleSubmit}>


              {/* =================================================
                  SERVICE
              ================================================= */}

              <div className="field-group">

                <label>

                  <i className="bi bi-grid"></i>

                  Select Service

                </label>


                {location.state?.service ? (

                  <div className="locked-service">

                    <div className="selected-service-icon">

                      <i
                        className={
                          isTutor
                            ? "bi bi-mortarboard-fill"
                            : "bi bi-tools"
                        }
                      ></i>

                    </div>


                    <div>

                      <small>
                        SELECTED SERVICE
                      </small>

                      <strong>
                        {formData.service}
                      </strong>

                    </div>


                    <i className="bi bi-check-circle-fill"></i>

                  </div>

                ) : (

                  <div className="input-wrap">

                    <i className="bi bi-grid-3x3-gap"></i>


                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                    >

                      <option value="">
                        Choose a service
                      </option>


                      {normalServices.map(
                        (service) => (

                          <option
                            key={service.id}
                            value={service.name}
                          >
                            {service.name}
                          </option>

                        )
                      )}


                      {tutorExists && (

                        <option value="Tutor">
                          Tutor
                        </option>

                      )}

                    </select>


                    <i className="bi bi-chevron-down select-arrow"></i>

                  </div>

                )}

              </div>


              {/* =================================================
                  SERVICE OPTIONS
              ================================================= */}

              {hasServiceOptions && (

                <div className="tutor-section">

                  <div className="tutor-title">

                    <div className="tutor-title-icon">

                      <i
                        className={
                          isTutor
                            ? "bi bi-mortarboard-fill"
                            : "bi bi-list-check"
                        }
                      ></i>

                    </div>


                    <div>

                      <span>
                        {isTutor
                          ? "TUTORING SERVICE"
                          : "SERVICE OPTIONS"}
                      </span>

                      <h4>
                        {optionSectionTitle}
                      </h4>

                    </div>

                  </div>


                  <div className="field-group">

                    <label>

                      <i
                        className={
                          isTutor
                            ? "bi bi-book"
                            : "bi bi-grid"
                        }
                      ></i>

                      {optionLabel}

                    </label>


                    <div className="input-wrap">

                      <i
                        className={
                          isTutor
                            ? "bi bi-book-half"
                            : "bi bi-list-check"
                        }
                      ></i>


                      <select
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        disabled={
                          currentOptionsLoading
                        }
                      >

                        <option value="">

                          {currentOptionsLoading
                            ? "Loading options..."
                            : `Choose ${isTutor ? "a subject" : "an option"}`}

                        </option>


                        {currentOptions.map(
                          (option) => (

                            <option
                              key={option.id}
                              value={option.name}
                            >
                              {option.name}
                            </option>

                          )
                        )}

                      </select>


                      <i className="bi bi-chevron-down select-arrow"></i>

                    </div>


                    {!currentOptionsLoading &&
                      currentOptions.length === 0 && (

                        <small className="field-error">

                          No options available for this service.

                        </small>

                      )}

                  </div>

                </div>

              )}


              {/* =================================================
                  NAME + ADDRESS
              ================================================= */}

              <div className="two-columns">


                {/* NAME */}

                <div className="field-group">

                  <label>

                    <i className="bi bi-person"></i>

                    Full Name

                  </label>


                  <div className="input-wrap">

                    <i className="bi bi-person"></i>


                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />

                  </div>

                </div>


                {/* ADDRESS */}

                <div className="field-group">

                  <label>

                    <i className="bi bi-geo-alt"></i>

                    Service Address

                  </label>


                  <LocationSearch
                    formData={formData}
                    setFormData={setFormData}
                  />

                </div>

              </div>


              {/* =================================================
                  DATE + PRICE
              ================================================= */}

              <div className="two-columns">


                {/* DATE */}

                <div className="field-group">

                  <label>

                    <i className="bi bi-calendar-event"></i>

                    Preferred Date

                  </label>


                  <div className="input-wrap">

                    <i className="bi bi-calendar3"></i>


                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                    />

                  </div>

                </div>


                {/* PRICE */}


                {/* PRICE */}

                <div className="price-display">

                  <span>
                    {isTutor
                      ? "SUBJECT FEE"
                      : "SERVICE PRICE"}
                  </span>

                  <strong>
                    ₹ {formData.amount === "" ||
                      formData.amount === null ||
                      formData.amount === undefined
                      ? "0"
                      : formData.amount}
                  </strong>

                  {formData.amount !== "" &&
                    formData.amount !== null &&
                    formData.amount !== undefined && (

                      <small>
                        Final price
                      </small>

                    )}

                </div>
                    <div className="col-md-4">
                <label>Time Slot</label>

                <div className="input-wrapper">
                  <i className="bi bi-clock"></i>

                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleChange}
                    required
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

              

              {/* =================================================
                  PAYMENT
              ================================================= */}

              <div className="field-group payment-group">

                <label>

                  <i className="bi bi-wallet2"></i>

                  Payment Option

                </label>


                <div className="payment-cards">


                  {/* PAY NOW */}

                  <label
                    className={
                      `payment-card ${formData.paymentTiming ===
                        "PAY_NOW"
                        ? "active"
                        : ""
                      }`
                    }
                  >

                    <input
                      type="radio"
                      name="paymentTiming"
                      value="PAY_NOW"
                      checked={
                        formData.paymentTiming ===
                        "PAY_NOW"
                      }
                      onChange={handleChange}
                    />


                    <div className="payment-card-icon">

                      <i className="bi bi-credit-card-2-front"></i>

                    </div>


                    <div className="payment-card-text">

                      <strong>
                        Pay Now
                      </strong>

                      <small>
                        Secure payment via Razorpay
                      </small>

                    </div>


                    <div className="payment-radio"></div>

                  </label>


                  {/* PAY AFTER SERVICE */}

                  <label
                    className={
                      `payment-card ${formData.paymentTiming ===
                        "PAY_AFTER_SERVICE"
                        ? "active"
                        : ""
                      }`
                    }
                  >

                    <input
                      type="radio"
                      name="paymentTiming"
                      value="PAY_AFTER_SERVICE"
                      checked={
                        formData.paymentTiming ===
                        "PAY_AFTER_SERVICE"
                      }
                      onChange={handleChange}
                    />


                    <div className="payment-card-icon">

                      <i className="bi bi-clock-history"></i>

                    </div>


                    <div className="payment-card-text">

                      <strong>
                        Pay After Service
                      </strong>

                      <small>
                        Pay when your service is completed
                      </small>

                    </div>


                    <div className="payment-radio"></div>

                  </label>

                </div>

              </div>


              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div className="booking-summary">

                <div className="summary-left">

                  <div className="summary-icon">

                    <i className="bi bi-receipt"></i>

                  </div>


                  <div>

                    <span>
                      BOOKING SUMMARY
                    </span>


                    <strong>

                      {formData.service ||
                        "Select a service"}

                      {formData.course
                        ? ` • ${formData.course}`
                        : ""}

                    </strong>

                  </div>

                </div>


                <div className="summary-price">

                  ₹ {formData.amount || "0"}

                </div>

              </div>


              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button
                type="submit"
                disabled={
                  !formData.service ||
                  (
                    hasServiceOptions &&
                    currentOptions.length === 0
                  )
                }
                className="confirm-booking-btn"
              >

                <span>

                  <i className="bi bi-check2-circle"></i>


                  {formData.id
                    ? "Update Booking"
                    : "Confirm Booking"}

                </span>


                <i className="bi bi-arrow-right"></i>

              </button>


              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="form-footer">

                <i className="bi bi-shield-check"></i>

                Your information is securely protected.
                We respect your privacy.

              </div>

            </form>

          </div>

        </div>

      </div>

    </div>

  );

}


// =====================================================
// GOOGLE MAPS PROVIDER
// =====================================================
//
// Map preview has been removed.
// APIProvider is still required for Google Places
// autocomplete/location suggestions.
// =====================================================

function MyBookingsWithGoogleMaps() {

  return (

    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      libraries={["places"]}
    >

      <MyBookings />

    </APIProvider>

  );

}


export default MyBookingsWithGoogleMaps;

