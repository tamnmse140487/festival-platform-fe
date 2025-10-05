import api from "./api";

export const accountServices = {
  create: (data) => api.post("/accounts/create", data),
  createStudent: (data) => api.post("/accounts/create-student", data),
  get: (params) => api.get("/accounts/search", { params }),
  delete: (params) => api.delete(`/accounts/delete`, { params }),
  softDelete: (params) => api.delete(`/accounts/IsDelete`, { params }),
  update: (params, data) => api.put(`/accounts/update`, data, { params }),
  importAccounts: (formData) =>
    api.post("/accounts/import-accounts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  sendEmail: (data) => api.post("/accounts/send-email", data),
  updatePassword: (params) =>
    api.put(`/accounts/update-password`, {}, { params }),
  sendOTP: (data) => api.post("/accounts/send-otp", data),
  confirmOTP: (data) => api.post("/accounts/confirm-otp", data),
};
