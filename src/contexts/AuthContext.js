import React, { createContext, useContext, useState, useEffect } from "react";
import { authServices } from "../services/authServices";
import { supplierServices } from "../services/supplierServices";
import { schoolServices } from "../services/schoolServices";
import { ROLE_NAME } from "../utils/constants";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authServices.login(credentials);
      const { accessToken: newToken, ...userData } = response.data;

      const roleFetchMap = {
        [ROLE_NAME.SUPPLIER]: {
          service: supplierServices,
          field: "supplierId",
          fieldName: "companyName",
        },
        [ROLE_NAME.SCHOOL_MANAGER]: {
          service: schoolServices,
          field: "schoolId",
          fieldName: "schoolName",
        },
      };

      const roleConfig = roleFetchMap[userData.role];
      if (roleConfig) {
        try {
          const { service, field, fieldName } = roleConfig;
          const roleResponse = await service.get({ accountId: userData.id });

          if (
            Array.isArray(roleResponse.data) &&
            roleResponse.data.length > 0
          ) {
            const matchedAccount = roleResponse.data.find(
              (item) => item.accountId === userData.id
            );

            if (matchedAccount) {
              userData[field] = matchedAccount[field];
              userData[fieldName] = matchedAccount[fieldName];
            }
          }
        } catch (roleError) {
          console.error(`Error fetching ${userData.role} data:`, roleError);
        }
      }

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.message || "Đăng nhập thất bại",
      };
    }
  };

  const loginWithGoogle = async (token) => {
    try {
      const response = await authServices.loginGoogle(token);
      const { accessToken: newToken, ...userData } = response.data;

      const roleFetchMap = {
        [ROLE_NAME.SUPPLIER]: {
          service: supplierServices,
          field: "supplierId",
          fieldName: "companyName",
        },
        [ROLE_NAME.SCHOOL_MANAGER]: {
          service: schoolServices,
          field: "schoolId",
          fieldName: "schoolName",
        },
      };

      const roleConfig = roleFetchMap[userData.role];
      if (roleConfig) {
        try {
          const { service, field, fieldName } = roleConfig;
          const roleResponse = await service.get({ accountId: userData.id });

          if (
            Array.isArray(roleResponse.data) &&
            roleResponse.data.length > 0
          ) {
            const matchedAccount = roleResponse.data.find(
              (item) => item.accountId === userData.id
            );

            if (matchedAccount) {
              userData[field] = matchedAccount[field];
              userData[fieldName] = matchedAccount[fieldName];
            }
          }
        } catch (roleError) {
          console.error(`Error fetching ${userData.role} data:`, roleError);
        }
      }

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.response?.data?.message || "Đăng nhập thất bại",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authServices.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Đăng ký thất bại",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const hasRole = (requiredRoles) => {
    if (!user) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(user.role);
  };

  const updateLocalUser = (patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...(patch || {}) };
      try {
        localStorage.setItem("user", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    hasRole,
    updateLocalUser,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
