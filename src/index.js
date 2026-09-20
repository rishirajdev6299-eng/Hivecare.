import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/variables.css";
import "./styles/utilities.css";
import "./styles/global.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // for dropdowns, modals, navbar toggler

import "./styles/variables.css";
import "./styles/utilities.css";
import "./styles/global.css";

import "@fontsource/inter";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

