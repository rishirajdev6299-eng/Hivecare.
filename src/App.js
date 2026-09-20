import React from "react";

import {
  BrowserRouter as Router,
  useLocation
} from "react-router-dom";

import "./styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import AppRoutes from "./routes/AppRoutes";


function AppContent() {

  const location = useLocation();

  const isAdmin =
    location.pathname === "/admin";

  const isWorker =
    location.pathname === "/worker";


  return (

    <>

      {!isAdmin && !isWorker && (
        <Navbar />
      )}


      <AppRoutes />


      {!isAdmin && !isWorker && (
        <Footer />
      )}

    </>
  );
}


function App() {

  return (

    <Router>

      <AppContent />

    </Router>

  );
}


export default App;