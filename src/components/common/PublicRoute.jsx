import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { ROLE_NAME } from "../../utils/constants";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (
    isAuthenticated &&
    (location.pathname.startsWith("/auth") || location.pathname === "/")
  ) {
    switch (user) {
      case ROLE_NAME.STUDENT:
      case ROLE_NAME.TEACHER:
      case ROLE_NAME.USER:
        <Navigate to="/app/festivals" replace />;
        break;

      default:
        <Navigate to="/app/dashboard" replace />;
        break;
    }
  }

  return children;
};

export default PublicRoute;
