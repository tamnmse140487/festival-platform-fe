import api from "./api";

export const accountServices = {
  create: (data) => api.post("/accounts/create", data),
  createStudent: (data) => api.post("/accounts/create-student", data),
  get: (params) => api.get("/accounts/search", { params }),
  delete: (params) => api.delete(`/accounts/delete`, { params }),
  update: (params, data) => api.put(`/accounts/update`, data, { params }),
  bulkCreateAccounts: (data) =>
    api.post("/accounts/bulk-create-students", data),
};
