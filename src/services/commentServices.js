import api from "./api";

export const commentServices = {
  get: (params) => api.get("/comments/search", { params }),
  create: (data) => api.post("/comments/create", data),
  update: (params) => api.put(`/comments/update`, {}, { params }),
  delete: (params) => api.delete(`/comments/delete`, { params }),
};
