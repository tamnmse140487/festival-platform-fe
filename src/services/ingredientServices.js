import api from "./api";

export const ingredientServices = {
  get: (params) => api.get("/ingredients/search", { params }),
  create: (data) => api.post("/ingredients/create", data),
  update: (params) => api.put(`/ingredients/update`, {}, { params }),
  delete: (params) => api.delete(`/ingredients/delete`, { params }),
};
