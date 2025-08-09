import api from "./api";

export const paymentServices = {
  get: (params) => api.get("/payments/search", { params }),
  create: (data) => api.post("/payments/create", data),
  update: (params) => api.put(`/payments/update`, {}, { params }),
  delete: (params) => api.delete(`/payments/delete`, { params }),
};
