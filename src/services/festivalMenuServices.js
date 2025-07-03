import api from "./api";

export const festivalMenuServices = {
  get: (params) => api.get("/festivalmenus/search", { params }),
  create: (data) => api.post("/festivalmenus", data),
  update: (params) => api.put(`/festivalmenus/update`, {}, { params }),
  delete: (params) => api.delete(`/festivalmenus/delete`, { params }),
};
