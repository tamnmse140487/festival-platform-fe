import api from "./api";

export const menuItemIngredientServices = {
  get: (params) => api.get("/menuitemingredients/search", { params }),
  create: (data) => api.post("/menuitemingredients/create", data),
  update: (params) => api.put(`/menuitemingredients/update`, {}, { params }),
  delete: (params) => api.delete(`/menuitemingredients/delete`, { params }),
};
