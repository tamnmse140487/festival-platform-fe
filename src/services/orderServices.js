import api from "./api";

export const ordersServices = {
  get: (params) => api.get("/orders/search", { params }),
  create: (data) => api.post("/orders/create", data),
  update: (params) => api.put(`/orders/update`, {}, { params }),
  delete: (params) => api.delete(`/orders/delete`, { params }),
};
