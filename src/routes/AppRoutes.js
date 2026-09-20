import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Services from "../pages/Services/Services";
import Register from "../pages/Register/Register";
import MyBookings from "../pages/MyBookings/MyBookings";
import AboutUs from "../pages/About/AboutUs";
import Contact from "../pages/Contact/Contact";
import PrivacyPolicy from "../pages/Privacy/PrivacyPolicy";
import Layout from "../components/Layout/Layout";
import ProtectedRoute, { AuthRedirect } from "./ProtectedRoute";
import History from "../pages/bookHistory/history";
import Profile from "../pages/Profile/Profile";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import WorkerDashboard from "../pages/WorkerDashBoard/WorkerDashboard";
import OAuthSuccess from "../pages/OAuthSuccess/OAuthSuccess";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
function AppRoutes() {

  return (

    <Routes>

      <Route path="/" element={<Home />} />

      <Route
        path="/services"
        element={<Services />}
      />

      <Route
        path="/login"
        element={
          <AuthRedirect>
            <Login />
          </AuthRedirect>
        }
      />

      <Route
        path="/register"
        element={<Register />}
      />
      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />
      <Route
        path="/oauth-success"
        element={<OAuthSuccess />}
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />


      <Route
        path="/worker"
        element={
          <ProtectedRoute allowedRole="WORKER">
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />


      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />


      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />


      <Route
        path="/about"
        element={<AboutUs />}
      />

      <Route
        path="/contact"
        element={<Contact />}
      />

      <Route
        path="/privacy"
        element={<PrivacyPolicy />}
      />

      <Route
        path="/profile"
        element={<Profile />}
      />

    </Routes>
  );
}

export default AppRoutes;