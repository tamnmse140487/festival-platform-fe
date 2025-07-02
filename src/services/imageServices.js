import api from "./api";

export const imageServices = {
  get: (params) => api.get("/images/search", { params }),
  create: (data) => api.post("/images/create", data),
  addToEntity: (data) => api.post("/images/add-to-entity", data),
  update: (params) => api.put(`/images/update`, {}, { params }),
  delete: (params) => api.delete(`/images/delete`, { params }),
};
