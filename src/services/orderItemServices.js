import api from "./api";

export const orderItemsServices = {
  get: (params) => api.get("/orderitems/search", { params }),
  create: (data) => api.post("/orderitems/create", data),
  update: (params) => api.put(`/orderitems/update`, {}, { params }),
  delete: (params) => api.delete(`/orderitems/delete`, { params }),
};
