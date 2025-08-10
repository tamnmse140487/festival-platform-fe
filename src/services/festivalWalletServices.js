import api from "./api";

export const festivalWalletServices = {
  get: (params) => api.get("/festivalwallets/search", { params }),
  create: (data) => api.post("/festivalwallets/create", data),
  update: (params) => api.put(`/festivalwallets/update`, {}, { params }),
  delete: (params) => api.delete(`/festivalwallets/delete`, { params }),
};
