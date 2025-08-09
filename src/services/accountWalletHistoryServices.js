import api from "./api";

export const accountWalletHistoriesServices = {
  get: (params) => api.get("/accountwallethistories/search", { params }),
  create: (data) => api.post("/accountwallethistories/create", data),
  update: (params) => api.put(`/accountwallethistories/update`, {}, { params }),
  delete: (params) => api.delete(`/accountwallethistories/delete`, { params }),
};
