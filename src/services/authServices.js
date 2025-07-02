import api from "./api";

export const authServices = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  refreshToken: () => api.post("/auth/refresh"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
};
