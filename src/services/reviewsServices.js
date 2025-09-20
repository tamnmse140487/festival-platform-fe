import api from "./api";

export const reviewsServices = {
  get: (params) => api.get("/reviews/search", { params }),
  create: (data) => api.post("/reviews/create", data),
  update: (params) => api.put(`/reviews/update`, {}, { params }),
  delete: (params) => api.delete(`/reviews/delete`, { params }),
};
