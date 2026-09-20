import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "../../api/api";
import "./OAuthSuccess.css";

function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const complete = async () => {
      try {
        const token = searchParams.get("token");
        if (!token) throw new Error("OAuth token was not received.");
        localStorage.setItem("token", token);
        // Never accept role/user data from the URL. Read the authoritative MySQL user.
        const response = await getCurrentUser();
        const user = response.data;
        if (!user?.id) throw new Error("Invalid account information.");
        const role = user.role?.toUpperCase();
        if (!active) return;
        setTimeout(() => {
          navigate(role === "ADMIN" ? "/admin" : role === "WORKER" ? "/worker" : "/", { replace: true });
        }, 500);
      } catch (err) {
        console.error("OAuth success error:", err);
        localStorage.removeItem("token");
        if (active) {
          setError("Google login completed, but we could not complete your HiveCare login.");
          setTimeout(() => navigate("/login?error=oauth_user_error", { replace: true }), 2500);
        }
      }
    };
    complete();
    return () => { active = false; };
  }, [navigate, searchParams]);

  return (
    <div className="oauth-success-page">
      <div className="oauth-success-card">
        {!error ? (
          <>
            <div className="oauth-success-icon"><i className="bi bi-check-lg"></i></div>
            <div className="oauth-success-spinner"></div>
            <h2>Login Successful</h2>
            <p>Welcome to HiveCare.</p>
            <span>Checking your account and redirecting...</span>
          </>
        ) : (
          <>
            <div className="oauth-error-icon"><i className="bi bi-x-lg"></i></div>
            <h2>Login Problem</h2>
            <p>{error}</p>
            <span>Redirecting to login...</span>
          </>
        )}
      </div>
    </div>
  );
}

export default OAuthSuccess;
