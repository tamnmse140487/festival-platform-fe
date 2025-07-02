import api from "./api";

export const festivalMapServices = {
  get: (params) => api.get("/festivalmaps/search", { params }),
  create: (data) => api.post("/festivalmaps/create", data),
  update: (params) => api.put(`/festivalmaps/update`, {}, { params }),
  delete: (params) => api.delete(`/festivalmaps/delete`, { params }),
};
