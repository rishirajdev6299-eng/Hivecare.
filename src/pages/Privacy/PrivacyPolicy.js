import React from "react";
import "../InfoPages.css";

export default function PrivacyPolicy() {
  return (
    <div className="info-page">

      <div className="info-container">

        {/* HEADER */}
        <div className="info-hero">

          <div className="info-icon">
            🔒
          </div>

          <h1>Privacy Policy</h1>

          <p>
            Your privacy, security, and trust are important to us.
          </p>

        </div>


        {/* CONTENT */}
        <div className="info-content">

          <section>
            <h2>Our Commitment to Your Privacy</h2>

            <p>
              At <strong>HiveCare</strong>, your privacy and trust are at
              the core of everything we do. We are committed to providing
              a secure, reliable, and personalized experience while
              protecting your personal information.
            </p>
          </section>


          <section>
            <h2>Information We Collect</h2>

            <p>
              When you use HiveCare, we may collect information such as
              your name, email address, phone number, service address,
              booking details, and other information required to provide
              our services.
            </p>
          </section>


          <section>
            <h2>How We Use Your Information</h2>

            <p>
              The information we collect is used to provide and improve
              our home-service platform. This may include:
            </p>

            <ul>
              <li>Processing service bookings</li>
              <li>Connecting customers with service professionals</li>
              <li>Providing customer support</li>
              <li>Managing your account</li>
              <li>Sending booking and service updates</li>
              <li>Improving our platform and services</li>
            </ul>
          </section>


          <section>
            <h2>Data Security</h2>

            <p>
              We take reasonable security measures to protect your
              information from unauthorized access, misuse, alteration,
              or disclosure. We continuously work to improve our security
              practices and maintain a safe environment for our users.
            </p>
          </section>


          <section>
            <h2>Payment Information</h2>

            <p>
              Payments made through HiveCare are processed using secure
              payment services. We do not intentionally store sensitive
              payment information such as complete card details on our
              platform.
            </p>
          </section>


          <section>
            <h2>Information Sharing</h2>

            <p>
              HiveCare does not sell your personal information. We only
              share information when necessary to provide the requested
              service, process a booking, complete a payment, provide
              customer support, or comply with applicable legal
              requirements.
            </p>
          </section>


          <section>
            <h2>Your Privacy Matters</h2>

            <p>
              We believe that users should feel confident when using
              HiveCare. Whether you are booking a plumber, electrician,
              cleaner, tutor, beautician, or another professional, we
              remain committed to protecting your information and
              providing a trustworthy experience.
            </p>
          </section>


          {/* LAST UPDATED */}
          <div className="policy-note">

            <span>🛡️</span>

            <div>
              <strong>Your privacy is important to us.</strong>

              <p>
                If you have any questions regarding this Privacy Policy,
                please contact our support team.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}