import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/api";
import "./ResetPassword.css";

function ResetPassword() {

  const [searchParams] =
    useSearchParams();

  const navigate =
    useNavigate();

  const token =
    searchParams.get("token");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");


    if (!token) {

      setError(
        "Invalid password reset link."
      );

      return;
    }


    if (password.length < 6) {

      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }


    if (password !== confirmPassword) {

      setError(
        "Passwords do not match."
      );

      return;
    }


    setLoading(true);


    try {

      await resetPassword(
        token,
        password
      );


      setMessage(
        "Password reset successfully! Redirecting to login..."
      );


      setTimeout(() => {

        navigate("/login", {
          replace: true
        });

      }, 2000);


    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );

      const backendMessage =
        error.response?.data;

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : "Unable to reset password."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="reset-password-page">

      <div className="reset-password-card">

        <div className="reset-password-icon">

          <i className="bi bi-shield-lock-fill"></i>

        </div>


        <h1>
          Create New Password
        </h1>


        <p>
          Enter your new HiveCare password below.
        </p>


        {error && (

          <div className="reset-error">

            <i className="bi bi-exclamation-circle-fill"></i>

            {error}

          </div>

        )}


        {message && (

          <div className="reset-success">

            <i className="bi bi-check-circle-fill"></i>

            {message}

          </div>

        )}


        <form onSubmit={handleSubmit}>

          <label>
            New Password
          </label>

          <div className="reset-input">

            <i className="bi bi-lock-fill"></i>

            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>


          <label>
            Confirm Password
          </label>

          <div className="reset-input">

            <i className="bi bi-lock-fill"></i>

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />

          </div>


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Resetting Password..."
              : "Reset Password"}

          </button>

        </form>


        <button
          className="reset-login-link"
          onClick={() =>
            navigate("/login")
          }
        >

          <i className="bi bi-arrow-left"></i>

          Back to Login

        </button>

      </div>

    </div>

  );
}

export default ResetPassword;