import api from "./api";

export const boothServices = {
  get: (params) => api.get("/booths/search", { params }),
  create: (data) => api.post("/booths/create", data),
  updateApprove: (params) => api.put(`/booths/approve`, {}, { params }),
  updateActivate: (params) => api.put(`/booths/activate`, {}, { params }),
  updateReject: (params) => api.put(`/booths/reject`, {}, { params }),
  delete: (params) => api.delete(`/booths/delete`, { params }),
};
