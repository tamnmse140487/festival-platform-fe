import api from "./api";

export const requestServices = {
  get: (params) => api.get("/requests/search", { params }),
  create: (data) => api.post("/requests/create", data),
  update: (params) => api.put(`/requests/update`, {}, { params }),
  delete: (params) => api.delete(`/requests/delete`, { params }),
};
