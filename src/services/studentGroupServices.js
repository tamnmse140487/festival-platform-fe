import api from "./api";

export const studentGroupServices = {
  get: (params) => api.get("/studentgroups/search", { params }),
  create: (data) => api.post("/studentgroups/create", data),
  update: (params) => api.put(`/studentgroups/update`, {}, { params }),
  delete: (params) => api.delete(`/studentgroups/delete`, { params }),
};
