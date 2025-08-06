import api from "./api";

export const walletServices = {
  get: (params) => api.get("/wallets/search", { params }),
  create: (data) => api.post("/wallets/create", data),
  update: (params) => api.put(`/wallets/update`, {}, { params }),
  delete: (params) => api.delete(`/wallets/delete`, { params }),
};
