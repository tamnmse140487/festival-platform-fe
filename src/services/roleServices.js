import api from "./api";

export const roleServices = {
  get: (params) => api.get("/roles/search", { params }),
  create: (data) => api.post("/roles/create", data),
  update: (params) => api.put(`/roles/update`, {}, { params }),
  delete: (params) => api.delete(`/roles/delete`, { params }),
};
