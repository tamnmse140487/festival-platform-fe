import api from "./api";

export const boothMenuItemServices = {
  get: (params) => api.get("/boothmenuitems/search", { params }),
  create: (data) => api.post("/boothmenuitems/create", data),
  update: (params) => api.put(`/boothmenuitems/update`, {}, { params }),
  delete: (params) => api.delete(`/boothmenuitems/delete`, { params }),
};
