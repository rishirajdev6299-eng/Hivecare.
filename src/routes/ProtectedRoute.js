import React from "react";
import {
  Navigate,
  useLocation
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function getRoleHome(role) {

  const normalizedRole = String(role || "")
    .trim()
    .toUpperCase();

  if (normalizedRole === "ADMIN") {
    return "/admin";
  }

  if (normalizedRole === "WORKER") {
    return "/worker";
  }

  return "/";
}


function ProtectedRoute({
  children,
  allowedRole
}) {

  const {
    user,
    loading
  } = useAuth();

  const location = useLocation();


  /* =========================================================
     CHECKING ACCOUNT
  ========================================================= */

  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "15px"
        }}
      >

        <div
          className="spinner-border"
          role="status"
        />

        <div>
          Checking your account...
        </div>

      </div>
    );

  }


  /* =========================================================
     NO LOGIN
  ========================================================= */

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location
        }}
      />
    );

  }


  /* =========================================================
     ROLE CHECK
  ========================================================= */

  const userRole = String(user.role || "")
    .trim()
    .toUpperCase();

  const requiredRole = String(allowedRole || "")
    .trim()
    .toUpperCase();


  if (
    requiredRole &&
    userRole !== requiredRole
  ) {

    return (
      <Navigate
        to={getRoleHome(userRole)}
        replace
      />
    );

  }


  /* =========================================================
     AUTHORIZED
  ========================================================= */

  return children;
}


/* =========================================================
   AUTH REDIRECT
========================================================= */

function AuthRedirect({
  children
}) {

  const {
    user,
    loading
  } = useAuth();


  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >

        Checking your account...

      </div>
    );

  }


  if (user) {

    return (
      <Navigate
        to={getRoleHome(user.role)}
        replace
      />
    );

  }


  return children;
}


export {
  AuthRedirect
};

export default ProtectedRoute;