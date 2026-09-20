# HiveCare Frontend

HiveCare Frontend is a modern, responsive React-based web application for **HiveCare**, a home-service management platform. It allows customers to discover services, book appointments, make online payments, track bookings, manage their profiles, and communicate with HiveCare support.

The application also provides dedicated **Admin and Worker dashboards** for managing services, bookings, workers, customers, payments, reviews, and service requests.

## Features

### Customer Features

* User Registration and Login
* Secure Authentication and Protected Routes
* Role-Based Access Control
* Browse Home Services
* Service Search and Filtering
* Service Options and Subject Selection
* Create and Manage Bookings
* Booking History
* Booking Status Tracking
* Booking Time Slots
* Payment Options
* Razorpay Online Payments
* Pay Now / Pay After Service
* Payment Status Tracking
* Digital Payment Receipts
* PDF Receipt Generation
* Google OAuth Login
* Profile Management
* Profile Picture Upload
* Address Autocomplete using Google Places
* Responsive Mobile Navigation
* Customer Reviews and Ratings
* HiveCare Support Chat
* Logout and Session Management
* Mobile-Friendly Responsive UI

### Worker Features

* Dedicated Worker Dashboard
* Worker Profile
* Worker Availability Management
* Online / Offline Availability Status
* View Assigned Bookings
* Accept Booking Requests
* Reject Booking Requests
* Complete Bookings
* View Booking Details
* View Customer Information
* Booking Status Management
* Worker Booking Statistics

### Admin Features

* Dedicated Admin Dashboard
* Admin Authentication
* Dashboard Statistics
* Customer Management
* Worker Management
* Service Management
* Create and Delete Services
* Create Worker Accounts
* Block / Unblock Users
* Booking Management
* Assign Workers to Bookings
* Update Booking Status
* Payment Management
* Revenue Statistics
* Collected and Outstanding Payment Tracking
* Monthly and Yearly Revenue Analytics
* Customer Reviews Management
* Booking Receipt Generation
* Booking Reports
* Monthly Booking Reports
* Yearly Booking Reports
* Full Booking Reports
* CSV Report Generation
* Admin Settings
* Auto Refresh
* Notification Settings
* Compact Dashboard Mode

## Authentication & Security

HiveCare uses backend-controlled authentication and authorization to protect customer, worker, and admin functionality.

* Protected Frontend Routes
* Role-Based Access Control
* Backend Role Verification
* JWT-Based Authentication
* Session Management
* Login Attempt Protection
* Temporary Login Lockout After Failed Attempts
* Blocked User Protection
* Secure API Communication
* Google OAuth Authentication
* Password Reset Support

> User roles are controlled by the backend/database rather than being trusted solely from frontend local storage.

## Payments

HiveCare integrates **Razorpay** for online payments.

Supported payment functionality includes:

* Create Razorpay Payment Orders
* Online Payment
* Pay Now
* Pay After Service
* Payment Verification
* Payment Status Tracking
* Razorpay Order ID Tracking
* Razorpay Payment ID Tracking
* Payment Signature Verification
* Payment Receipts
* PDF Receipt Generation

## Booking System

Customers can create and manage service bookings through the application.

The booking system supports:

* Service Selection
* Customer Information
* Address
* Date Selection
* Time Slot
* Service-Specific Options
* Problem Description
* Worker Assignment
* Payment Method
* Payment Timing
* Booking Status
* Payment Status
* Booking Completion
* Booking Cancellation / Rejection Handling
* Booking History

## Support Chat

HiveCare includes an integrated support chat interface that allows users to communicate with HiveCare support.

The chat system supports:

* Customer Support Chat
* User Information Context
* User Role Context
* Worker Service Context
* Backend Chat API Integration
* AI-Assisted Support

## Responsive Design

The application is designed for desktop, tablet, and mobile devices.

Responsive features include:

* Mobile-Friendly Navbar
* Hamburger Navigation Menu
* Responsive Service Cards
* Responsive Dashboards
* Mobile Booking Interface
* Responsive Forms
* Responsive Profile Menu
* Desktop and Mobile Layouts

## Tech Stack

### Frontend

* React
* JavaScript (ES6+)
* React Router
* Axios
* HTML5
* CSS3
* Bootstrap
* Responsive Web Design

### Backend Integration

* Spring Boot
* REST APIs
* JWT Authentication
* Spring Security
* MySQL
* Google OAuth
* Razorpay API

### Libraries & Tools

* jsPDF
* Google Maps / Places API
* Axios
* React Router
* Git & GitHub
* npm

## Main Pages

### Customer Pages

* Home
* Services
* Service Details
* Login
* Register
* My Bookings
* Booking History
* Profile
* About Us
* Contact
* Privacy Policy

### Worker Pages

* Worker Dashboard
* Worker Bookings
* Worker Profile
* Worker Availability

### Admin Pages

* Admin Dashboard
* Booking Management
* User Management
* Worker Management
* Service Management
* Payment Analytics
* Reviews
* Reports
* Admin Settings

## Project Architecture

The frontend follows a component-based React architecture.

```text
src/
├── api/
│   └── api.js
├── assets/
│   └── images/
├── components/
│   ├── Navbar/
│   ├── Footer/
│   └── ProtectedRoute/
├── context/
│   └── AuthContext.js
├── pages/
│   ├── Home/
│   ├── Services/
│   ├── Login/
│   ├── Register/
│   ├── Bookings/
│   ├── History/
│   ├── Profile/
│   ├── AdminDashboard/
│   └── WorkerDashboard/
├── App.js
└── index.js
```

## Backend

HiveCare Frontend communicates with the HiveCare Spring Boot backend through REST APIs.

The backend handles:

* Authentication
* Authorization
* User Management
* Worker Management
* Service Management
* Booking Management
* Payment Verification
* Reviews
* Reports
* Profile Management
* Support Chat
* Database Operations

## Deployment

The HiveCare frontend can be deployed using modern frontend hosting platforms such as:

* Vercel
* Netlify
* Other React-compatible hosting platforms

The backend can be deployed separately and connected to the frontend through the configured API URL.

## Future Enhancements

Planned improvements may include:

* Advanced Real-Time Notifications
* Push Notifications
* Improved AI Support
* Live Worker Location Tracking
* Advanced Booking Scheduling
* More Payment Options
* Enhanced Analytics
* Progressive Web App Support
* Further Performance Optimization

## Project Status

HiveCare is an actively developed full-stack home-service platform consisting of:

**React Frontend + Spring Boot Backend + MySQL Database + Razorpay Payments + OAuth Authentication**

The platform supports three primary user roles:


CUSTOMER
   ↓
Browse Services → Book Service → Payment → Track Booking → Review

WORKER
   ↓
View Requests → Accept/Reject → Complete Service

ADMIN
   ↓
Manage Users → Services → Workers → Bookings → Payments → Reports