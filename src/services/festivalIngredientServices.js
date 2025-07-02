import api from "./api";

export const festivalIngredientServices = {
  get: (params) => api.get("/festivalingredients/search", { params }),
  create: (data) => api.post("/festivalingredients/create", data),
  update: (params) => api.put(`/festivalingredients/update`, {}, { params }),
  delete: (params) => api.delete(`/festivalingredients/delete`, { params }),
};
