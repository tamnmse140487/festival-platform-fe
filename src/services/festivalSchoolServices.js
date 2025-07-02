import api from "./api";

export const festivalSchoolServices = {
  get: (params) => api.get("/festivalschools/search", { params }),
  create: (data) => api.post("/festivalschools/create", data),
  update: (params) => api.put(`/festivalschools/update`, {}, { params }),
  delete: (params) => api.delete(`/festivalschools/delete`, { params }),
};
