import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { ROLE_NAME } from "../../utils/constants";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      isAuthenticated &&
      (location.pathname.startsWith("/auth") || location.pathname === "/")
    ) {
      if (
        user?.role === ROLE_NAME.STUDENT ||
        user?.role === ROLE_NAME.TEACHER ||
        user?.role === ROLE_NAME.USER
      ) {
        navigate("/app/festivals", { replace: true });
      } else {
        navigate("/app/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, location, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return children;
};

export default PublicRoute;
