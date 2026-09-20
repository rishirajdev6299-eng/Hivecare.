import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";

import { getCurrentUser } from "../api/api";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);


  const refreshUser = useCallback(async () => {

    const token = localStorage.getItem("token");


    /* =========================================================
       NO TOKEN
    ========================================================= */

    if (!token) {

      setUser(null);
      setLoading(false);

      return null;

    }


    /* =========================================================
       CHECK BACKEND
    ========================================================= */

    try {

      setLoading(true);


      const response = await getCurrentUser();

      const currentUser = response.data;


      // console.log(
      //   "AUTH USER FROM BACKEND:",
      //   currentUser
      // );


      if (
        !currentUser ||
        !currentUser.id
      ) {

        throw new Error(
          "Backend returned an invalid user."
        );

      }


      const normalizedUser = {

        ...currentUser,

        role: currentUser.role
          ? String(currentUser.role)
              .trim()
              .toUpperCase()
          : null

      };


      // console.log(
      //   "AUTH ROLE:",
      //   normalizedUser.role
      // );


      setUser(normalizedUser);

      return normalizedUser;


    } catch (error) {

      console.error(
        "Unable to authenticate current user:",
        error
      );


      console.error(
        "Status:",
        error.response?.status
      );


      console.error(
        "Backend response:",
        error.response?.data
      );


      if (
        error.response?.status === 401
      ) {

        localStorage.removeItem("token");

      }


      setUser(null);

      return null;


    } finally {

      setLoading(false);

    }

  }, []);


  /* =========================================================
     INITIAL AUTH CHECK
  ========================================================= */

  useEffect(() => {

    refreshUser();

  }, [refreshUser]);


  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = useCallback(() => {

    localStorage.removeItem("token");

    setUser(null);

  }, []);


  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        logout
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


export function useAuth() {

  const value = useContext(AuthContext);


  if (!value) {

    throw new Error(
      "useAuth must be used inside AuthProvider."
    );

  }


  return value;

}