import api from "./api";

export const menuItemServices = {
  get: (params) => api.get("/menuitems/search", { params }),
  create: (data) => api.post("/menuitems/create", data),
  update: (params) => api.put(`/menuitems/update`, {}, { params }),
  delete: (params) => api.delete(`/menuitems/delete`, { params }),
};
