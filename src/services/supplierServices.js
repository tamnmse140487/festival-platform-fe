import api from "./api";

export const supplierServices = {
  get: (params) => api.get("/suppliers/search", { params }),
  create: (data) => api.post("/suppliers/create", data),
  update: (params) => api.put(`/suppliers/update`, {}, { params }),
  delete: (params) => api.delete(`/suppliers/delete`, { params }),
};
