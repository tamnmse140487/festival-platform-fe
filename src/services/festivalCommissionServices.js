import api from "./api";

export const festivalCommissionServices = {
  get: (params) => api.get("/festival-commissions/search", { params }),
  create: (data) => api.post("/festival-commissions/create", data),
  update: (params, commissionId) =>
    api.put(`/festival-commissions/update/${commissionId}`, {}, { params }),
  delete: (commissionId) => api.delete(`/festival-commissions/delete/${commissionId}`, { commissionId }),
};
