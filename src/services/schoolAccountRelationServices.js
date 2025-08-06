import api from "./api";

export const schoolAccountRelationServices = {
  get: (params) => api.get("/schoolaccountrelations/search", { params }),
  create: (data) => api.post("/schoolaccountrelations/create", data),
  update: (params) => api.put(`/schoolaccountrelations/update`, {}, { params }),
  delete: (params) => api.delete(`/schoolaccountrelations/delete`, { params }),
};
