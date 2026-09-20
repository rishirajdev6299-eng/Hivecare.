import React, { useEffect, useState } from "react";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
import {
  getServices,
  getServiceOptions
} from "../../api/api";
import "./Services.css";
import { useLocation } from "react-router-dom";

function Services() {

  const [services, setServices] = useState([]);
  const [serviceOptions, setServiceOptions] = useState({});
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  const searchParams =
    new URLSearchParams(location.search);

  const search =
    searchParams.get("search") || "";


  // =====================================================
  // OPTION BASED SERVICES
  // =====================================================

  const isOptionService = (serviceName) => {

    const name =
      serviceName?.trim().toLowerCase() || "";

    return (
      name === "tutor" ||
      name === "beautician" ||
      name === "house cleaning" ||
      name === "appliance repair"
    );
  };


  // =====================================================
  // LOAD SERVICES
  // =====================================================

  const loadServices = async () => {

    setLoading(true);

    try {

      const response =
        await getServices();

      const serviceData =
        Array.isArray(response.data)
          ? response.data
          : [];

      setServices(serviceData);


      // ================================================
      // LOAD OPTIONS ONLY FOR FOUR SERVICES
      // ================================================

      const optionData = {};

      for (const service of serviceData) {

        if (!isOptionService(service.name)) {
          continue;
        }

        try {

          const optionResponse =
            await getServiceOptions(service.name);

          const options =
            Array.isArray(optionResponse.data)
              ? optionResponse.data
              : [];

          optionData[service.name] = options;

        } catch (error) {

          console.error(
            `Error loading options for ${service.name}:`,
            error
          );

          optionData[service.name] = [];
        }
      }

      setServiceOptions(optionData);

    } catch (error) {

      console.error(
        "Error fetching services:",
        error
      );

      setServices([]);

    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {

    loadServices();

  }, []);


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredServices =
    services.filter((service) =>
      service.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );


  // =====================================================
  // MINIMUM OPTION PRICE
  // =====================================================

  const getMinimumOptionPrice = (serviceName) => {

    const options =
      serviceOptions[serviceName] || [];

    const prices = options
      .map((option) => Number(option.price))
      .filter(
        (price) =>
          Number.isFinite(price) &&
          price > 0
      );

    if (prices.length === 0) {
      return null;
    }

    return Math.min(...prices);
  };


  // =====================================================
  // DISPLAY PRICE
  // =====================================================

  const getDisplayPrice = (service) => {

    // -----------------------------------------------
    // Tutor / Beautician / House Cleaning /
    // Appliance Repair
    // -----------------------------------------------

    if (isOptionService(service.name)) {

      const minimumPrice =
        getMinimumOptionPrice(service.name);

      if (minimumPrice !== null) {
        return minimumPrice;
      }

      // If options have not returned a price yet,
      // use service price if backend has one.
      if (
        service.price !== null &&
        service.price !== undefined &&
        service.price !== ""
      ) {
        return service.price;
      }

      return null;
    }


    // -----------------------------------------------
    // NORMAL SERVICES
    // -----------------------------------------------

    if (
      service.price !== null &&
      service.price !== undefined &&
      service.price !== ""
    ) {
      return service.price;
    }

    return null;
  };


  // =====================================================
  // SERVICE ICON
  // =====================================================

  const getServiceIcon = (name) => {

    const serviceName =
      name?.toLowerCase() || "";

    if (serviceName.includes("plumber")) {
      return "bi bi-wrench-adjustable";
    }

    if (serviceName.includes("electric")) {
      return "bi bi-lightning-charge-fill";
    }

    if (serviceName.includes("carpenter")) {
      return "bi bi-hammer";
    }

    if (serviceName.includes("maid")) {
      return "bi bi-house-heart-fill";
    }

    if (serviceName.includes("baby")) {
      return "bi bi-person-hearts";
    }

    if (serviceName.includes("pet")) {
      return "bi bi-heart-fill";
    }

    if (serviceName.includes("gym")) {
      return "bi bi-activity";
    }

    if (serviceName.includes("beaut")) {
      return "bi bi-stars";
    }

    if (serviceName.includes("yoga")) {
      return "bi bi-person-standing";
    }

    if (serviceName.includes("tutor")) {
      return "bi bi-mortarboard-fill";
    }

    if (
      serviceName.includes("clean") ||
      serviceName.includes("house")
    ) {
      return "bi bi-house-check-fill";
    }

    if (
      serviceName.includes("appliance") ||
      serviceName.includes("repair")
    ) {
      return "bi bi-tools";
    }

    return "bi bi-tools";
  };


  // =====================================================
  // CATEGORY
  // =====================================================

  const getServiceCategory = (name) => {

    const serviceName =
      name?.toLowerCase() || "";

    if (serviceName.includes("tutor")) {
      return "Education";
    }

    if (
      serviceName.includes("gym") ||
      serviceName.includes("yoga")
    ) {
      return "Health & Fitness";
    }

    if (
      serviceName.includes("beaut") ||
      serviceName.includes("maid") ||
      serviceName.includes("clean")
    ) {
      return "Home & Personal";
    }

    if (
      serviceName.includes("appliance") ||
      serviceName.includes("repair")
    ) {
      return "Home Appliances";
    }

    return "Professional Service";
  };


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <div className="services-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="services-hero">

        <div className="services-hero-glow glow-one"></div>

        <div className="services-hero-glow glow-two"></div>

        <div className="container">

          <div className="services-hero-content">

            <div className="hero-badge">

              <i className="bi bi-patch-check-fill"></i>

              TRUSTED BY HIVECARE

            </div>

            <h1>

              Professional Services

              <span>
                At Your Doorstep
              </span>

            </h1>

            <p>
              From home repairs to personal care,
              find trusted professionals and book
              reliable services in just a few clicks.
            </p>

            {search && (

              <div className="active-search">

                <i className="bi bi-search"></i>

                <span>
                  Showing results for
                </span>

                <strong>
                  "{search}"
                </strong>

              </div>

            )}

          </div>

        </div>

      </section>


      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="services-content">

        <div className="container">

          {/* TOP BAR */}

          <div className="services-topbar">

            <div>

              <span className="section-label">
                EXPLORE SERVICES
              </span>

              <h2>
                What do you need today?
              </h2>

              <p>
                Choose from our wide range of
                professional services.
              </p>

            </div>


            <div className="service-count-card">

              <div className="count-icon">

                <i className="bi bi-grid-3x3-gap-fill"></i>

              </div>

              <div>

                <strong>
                  {filteredServices.length}
                </strong>

                <span>
                  Services Available
                </span>

              </div>

            </div>

          </div>


          {/* LOADING */}

          {loading && (

            <div className="services-loading">

              <div className="loading-animation">

                <span></span>
                <span></span>
                <span></span>

              </div>

              <h5>
                Finding services for you...
              </h5>

              <p>
                Please wait while we load our
                professional services.
              </p>

            </div>

          )}


          {/* SERVICES */}

          {!loading &&
            filteredServices.length > 0 && (

              <div className="services-grid">

                {filteredServices.map(
                  (service, index) => {

                    const displayPrice =
                      getDisplayPrice(service);

                    return (

                      <div
                        key={service.id}
                        className="service-column"
                        style={{
                          animationDelay:
                            `${index * 70}ms`
                        }}
                      >

                        <div className="modern-service-card">

                          {/* ICON */}

                          <div className="service-icon-wrapper">

                            <div className="service-icon">

                              <i
                                className={
                                  getServiceIcon(
                                    service.name
                                  )
                                }
                              ></i>

                            </div>

                            <span className="service-number">

                              {String(index + 1)
                                .padStart(2, "0")}

                            </span>

                          </div>


                          {/* CATEGORY */}

                          <div className="service-category">

                            {getServiceCategory(
                              service.name
                            )}

                          </div>


                          {/* SERVICE CARD */}

                          <div className="service-card-content">

                            <ServiceCard

                              title={service.name}

                              description={
                                service.description
                              }

                              icon={
                                <i
                                  className={
                                    getServiceIcon(
                                      service.name
                                    )
                                  }
                                ></i>
                              }

                            />

                          </div>


                          {/* PRICE */}

                          <div className="service-bottom">

                            <div className="price-section">

                              <span>
                                Starting from
                              </span>

                              {displayPrice !== null ? (

                                <strong>
                                  ₹{displayPrice}
                                </strong>

                              ) : (

                                <strong className="price-unavailable">
                                  Contact Us
                                </strong>

                              )}

                            </div>

                          </div>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}


          {/* EMPTY */}

          {!loading &&
            filteredServices.length === 0 && (

              <div className="empty-services">

                <div className="empty-icon">

                  <i className="bi bi-search"></i>

                </div>

                <span className="empty-label">
                  SERVICE NOT FOUND
                </span>

                <h3>
                  No Services Available
                </h3>

                <p>

                  {search
                    ? `We couldn't find a service matching "${search}". Try searching for another service.`
                    : "No services are currently available. Please check again later."
                  }

                </p>

              </div>

            )}


          {/* TRUST */}

          {!loading &&
            filteredServices.length > 0 && (

              <div className="services-trust">

                <div className="trust-item">

                  <div className="trust-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>

                  <div>

                    <strong>
                      Trusted Professionals
                    </strong>

                    <span>
                      Verified service providers
                    </span>

                  </div>

                </div>


                <div className="trust-item">

                  <div className="trust-icon">
                    <i className="bi bi-clock-history"></i>
                  </div>

                  <div>

                    <strong>
                      Easy Booking
                    </strong>

                    <span>
                      Book in just a few clicks
                    </span>

                  </div>

                </div>


                <div className="trust-item">

                  <div className="trust-icon">
                    <i className="bi bi-credit-card"></i>
                  </div>

                  <div>

                    <strong>
                      Secure Payment
                    </strong>

                    <span>
                      Safe and reliable payments
                    </span>

                  </div>

                </div>

              </div>

            )}

        </div>

      </section>

    </div>

  );
}

export default Services;