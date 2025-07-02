import api from "./api";

export const festivalSchoolServices = {
  get: (params) => api.get("/festivalschools/search", { params }),
  create: (data) => api.post("/festivalschools/create", data),
  update: (params) => api.put(`/festivalschools/update`, {}, { params }),
  updateRejectStatus: (params) => api.put(`/festivalschools/update/reject`, {}, { params }),
  updateApproveStatus: (params) => api.put(`/festivalschools/update/approve`, {}, { params }),
  delete: (params) => api.delete(`/festivalschools/delete`, { params }),
};
