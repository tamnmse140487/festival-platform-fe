import api from "./api";

export const boothWalletServices = {
  get: (params) => api.get("/boothwallets/search", { params }),
  create: (data) => api.post("/boothwallets/create", data),
  update: (params) => api.put(`/boothwallets/update`, {}, { params }),
  delete: (params) => api.delete(`/boothwallets/delete`, { params }),
  updateBalance: (params) => api.put(`/boothwallets/update-total-balance`, {}, { params }),
};
