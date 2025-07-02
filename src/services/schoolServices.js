import api from "./api";

export const schoolServices = {
  get: (params) => api.get("/schools/search", { params }),
  create: (data) => api.post("/schools/create", data),
  update: (params) => api.put(`/schools/update`, {}, { params }),
  delete: (params) => api.delete(`/schools/delete`, { params }),
};
