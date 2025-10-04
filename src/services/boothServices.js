import api from "./api";

export const boothServices = {
  get: (params) => api.get("/booths/search", { params }),
  create: (data) => api.post("/booths/create", data),
  updateApprove: (params, data) => api.put(`/booths/approve`, data, { params }),
  updateActivate: (params) => api.put(`/booths/activate`, {}, { params }),
  updateReject: (params) => api.put(`/booths/reject`, {}, { params }),
  delete: (params) => api.delete(`/booths/delete`, { params }),
  updateBooth: (params, data) => api.put(`/booths/update`, data, { params }),
  withdraw: (data) => api.post("/booths/withdraw-revenue", data),
  canWithdrawRevenue: (params) => api.get("/booths/can-withdraw-revenue", { params }),
};
