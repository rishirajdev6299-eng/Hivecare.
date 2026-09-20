import axios from "axios";

const API_BASE = "http://localhost:8080/api";


// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

axios.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {

      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${token}`;

      console.log(
        "JWT ATTACHED:",
        token.substring(0, 20) + "..."
      );
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

axios.interceptors.response.use(

  (response) => {
    return response;
  },

  (error) => {

    console.error(
      "API ERROR:",
      error.config?.url,
      error.response?.status,
      error.response?.data
    );

    if (error.response?.status === 401) {

      localStorage.removeItem("token");

      window.dispatchEvent(
        new Event("hivecare-auth-invalid")
      );
    }

    return Promise.reject(error);
  }
);

// =====================================================
// SERVICES
// =====================================================

export const getServices = () =>
  axios.get(`${API_BASE}/services`);

export const createService = (service) =>
  axios.post(`${API_BASE}/services`, service);

// export const getSubjects = () => axios.get(`${API_BASE}/subjects`);
//  export const getTutorSubjects = () => axios.get(`${API_BASE}/subjects/tutor`); 

// export const getServices = () => axios.get(`${API_BASE}/services`);


// =====================================================
// BOOKINGS
// =====================================================

export const getServiceOptions = (serviceName) => {
    return axios.get(
        `${API_BASE}/subjects/service/${encodeURIComponent(serviceName)}`
    );
};

export const getBookings = () =>
  axios.get(`${API_BASE}/bookings`);

export const createBooking = (booking) =>
  axios.post(`${API_BASE}/bookings`, booking);

export const updateBooking = (
  id,
  booking
) =>
  axios.put(
    `${API_BASE}/bookings/${id}`,
    booking
  );

export const deleteBooking = (id) =>
  axios.delete(
    `${API_BASE}/bookings/${id}`
  );

export const getUserBookings = (
  userId
) =>
  axios.get(
    `${API_BASE}/bookings/user/${userId}`
  );


// =====================================================
// USERS
// =====================================================

export const registerUser = (
  user
) =>
  axios.post(
    `${API_BASE}/users/register`,
    user
  );

export const loginUser = (
  credentials
) =>
  axios.post(
    `${API_BASE}/users/login`,
    credentials
  );

export const getCurrentUser = () =>
  axios.get(`${API_BASE}/users/me`);

export const getUserById = (
  id
) =>
  axios.get(
    `${API_BASE}/users/${id}`
  );

export const updateUser = (
  id,
  user
) =>
  axios.put(
    `${API_BASE}/users/${id}`,
    user
  );


// =====================================================
// ADMIN
// =====================================================

export const getAdminStats = () =>
  axios.get(
    `${API_BASE}/admin/stats`
  );

export const getAdminBookings = () =>
  axios.get(
    `${API_BASE}/admin/bookings`
  );

export const getAdminServices = () =>
  axios.get(
    `${API_BASE}/admin/services`
  );

export const getAdminWorkers = () =>
  axios.get(
    `${API_BASE}/admin/workers`
  );

export const getAdminUsers = () =>
  axios.get(
    `${API_BASE}/admin/users`
  );


// =====================================================
// WORKER
// =====================================================

export const getWorker = (
  workerId
) =>
  axios.get(
    `${API_BASE}/workers/${workerId}`
  );


export const getWorkerRequests = (
  workerId
) =>
  axios.get(
    `${API_BASE}/workers/${workerId}/requests`
  );


export const getWorkerBookings = (
  workerId
) =>
  axios.get(
    `${API_BASE}/workers/${workerId}/bookings`
  );


export const acceptBooking = (
  workerId,
  bookingId
) =>
  axios.put(
    `${API_BASE}/workers/${workerId}/bookings/${bookingId}/accept`
  );


export const rejectBooking = (
  workerId,
  bookingId
) =>
  axios.put(
    `${API_BASE}/workers/${workerId}/bookings/${bookingId}/reject`
  );


// =====================================================
// COMPLETE SERVICE
// =====================================================

export const completeService = (
  workerId,
  bookingId
) =>
  axios.put(
    `${API_BASE}/workers/${workerId}/bookings/${bookingId}/complete`
  );


// =====================================================
// PAYMENT
// =====================================================

// 1. CREATE RAZORPAY ORDER

export const createPaymentOrder = (
  bookingId
) =>
  axios.post(
    `${API_BASE}/payment/create-order/${bookingId}`
  );


// 2. VERIFY RAZORPAY PAYMENT

export const verifyPayment = (
  paymentData
) =>
  axios.post(
    `${API_BASE}/payment/verify`,
    paymentData
  );


// 3. GET PAYMENT RECEIPT

export const getPaymentReceipt = (
  bookingId
) =>
  axios.get(
    `${API_BASE}/payment/receipt/${bookingId}`
  );

  // =====================================================
// CANCEL BOOKING
// Booking is NOT deleted from database.
// Only status becomes CANCELLED.
// =====================================================

export const cancelBooking = (bookingId) => {
  return axios.put(
    `${API_BASE}/bookings/${bookingId}/cancel`
  );
};


/// =====================================================
// ADMIN DELETE BOOKING
// This permanently deletes booking from database.
// =====================================================

export const deleteAdminBooking = (bookingId) => {
  return axios.delete(
    `${API_BASE}/admin/bookings/${bookingId}`
  );
};


// =========================================================
// ADMIN USER BLOCK / UNBLOCK
// =========================================================

export const blockAdminUser = (userId) => {
  return axios.put(`${API_BASE}/users/admin/${userId}/block`);
};

export const unblockAdminUser = (userId) => {
  return axios.put(`${API_BASE}/users/admin/${userId}/unblock`);
};

// =====================================================
// ADMIN WORKERS
// =====================================================

// export const getAdminWorkers = () =>{
// return axios.get("/workers/admin/all");
// }
  

export const createAdminWorker = (worker) =>{
return axios.post(`${API_BASE}/workers/admin/create`, worker);
}
  

export const searchAdminWorkers = (search) =>{
return axios.get(
    `${API_BASE}/workers/admin/search?search=${encodeURIComponent(search)}`
  );
}
  
// CREATE SERVICE
 export const createAdminService = (service) => { return axios.post(`${API_BASE}/services`, service); }; 
// // GET ALL SERVICES
//  export const getAdminServices = () => { return axios.get(`${API_BASE}/services`); };
// // UPDATE SERVICE 
export const updateAdminService = (id, service) => { return axios.put(`${API_BASE}/services/${id}`, service); }; 
// // DELETE SERVICE
 export const deleteAdminService = (id) => { return axios.delete(`${API_BASE}/services/${id}`); };

 export const getSubjects = () => {
return axios.get(`${API_BASE}/subjects`);
};

export const getTutorSubjects = () => {
return axios.get(`${API_BASE}/subjects/tutor`);
};

// =====================================================
// ADMIN SERVICE OPTIONS / SUBJECTS
// =====================================================

// CREATE SERVICE OPTION / SUBJECT
export const createServiceOption = (option) => {
  return axios.post(
    `${API_BASE}/subjects`,
    option
  );
};


// UPDATE SERVICE OPTION / SUBJECT
export const updateServiceOption = (
  id,
  option
) => {
  return axios.put(
    `${API_BASE}/subjects/${id}`,
    option
  );
};


// DELETE SERVICE OPTION / SUBJECT
export const deleteServiceOption = (
  id
) => {
  return axios.delete(
    `${API_BASE}/subjects/${id}`
  );
};
// =====================================================
// WORKER AVAILABILITY
// =====================================================

export const setWorkerOnline = (workerId) => {
  return axios.put(
    `/api/workers/${workerId}/online`
  );
};

export const setWorkerOffline = (workerId) => {
  return axios.put(
    `${API_BASE}/workers/${workerId}/offline`
  );
};


// =====================================================
// UPDATE WORKER AVAILABILITY
// =====================================================

export const updateWorkerAvailability = (
  workerId,
  available
) => {

  return axios.put(
    `${API_BASE}/workers/${workerId}/availability`,
    null,
    {
      params: {
        available: available
      }
    }
  );

};



// =====================================================
// FORGOT PASSWORD
// =====================================================

export const forgotPassword = (email) =>
  axios.post(
    `${API_BASE}/users/forgot-password`,
    {
      email: email
    }
  );


// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword = (
  token,
  password
) =>
  axios.post(
    `${API_BASE}/users/reset-password`,
    {
      token: token,
      password: password
    }
  );


export const sendChatMessage = (chatData) => { return axios.post( `${API_BASE}/chat`, chatData ); };

// =====================================================
// REVIEWS
// =====================================================

// PUBLIC REVIEWS
// Used by Home page
export const getReviews = () =>
  axios.get(`${API_BASE}/reviews`);

// ADMIN REVIEWS
// Used only by AdminDashboard
export const getAdminReviews = () =>
  axios.get(`${API_BASE}/reviews/admin`);

export const createReview = (reviewData) =>
  axios.post(
    `${API_BASE}/reviews`,
    reviewData
  );

export const getWorkerReviews = (
  workerId
) =>
  axios.get(
    `${API_BASE}/reviews/worker/${workerId}`
  );

export const getUserReviews = (
  userId
) =>
  axios.get(
    `${API_BASE}/reviews/user/${userId}`
  );

export const getBookingReview = (
  bookingId
) =>
  axios.get(
    `${API_BASE}/reviews/booking/${bookingId}`
  );

export const deleteReview = (
  reviewId
) =>
  axios.delete(
    `${API_BASE}/reviews/${reviewId}`
  );

// =====================================================
// UPDATE PROFILE IMAGE
// =====================================================

export const updateProfileImage = (
  userId,
  profileImage
) =>
  axios.put(
    `${API_BASE}/users/${userId}/profile-image`,
    {
      profileImage: profileImage
    }
  );