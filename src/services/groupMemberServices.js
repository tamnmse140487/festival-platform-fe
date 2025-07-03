import api from "./api";

export const groupMemberServices = {
  get: (params) => api.get("/groupmembers/search", { params }),
  create: (data) => api.post("/groupmembers/create", data),
  update: (params) => api.put(`/groupmembers/update`, {}, { params }),
  delete: (params) => api.delete(`/groupmembers/delete`, { params }),
};
