import api from "./api";

export const mapLocationServices = {
  get: (params) => api.get("/maplocations/search", { params }),
  create: (data) => api.post("/maplocations/create", data),
  update: (params) => api.put(`/maplocations/update`, {}, { params }),
  delete: (params) => api.delete(`/maplocations/delete`, { params }),
};
