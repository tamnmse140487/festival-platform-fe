import api from "./api";

export const festivalServices = {
  get: (params) => api.get("/festivals/search", { params }),
  create: (data) => api.post("/festivals/create", data),
  update: (params) => api.put(`/festivals/update`, {}, { params }),
  delete: (params) => api.delete(`/festivals/delete`, { params }),
};
