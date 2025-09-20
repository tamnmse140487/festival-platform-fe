import api from "./api";

export const festivalParticipantsServices = {
  get: (params) => api.get("/festivalparticipants/search", { params }),
  create: (data) => api.post("/festivalparticipants/create", data),
  delete: (data) => api.delete(`/festivalparticipants/delete`, { data }),
};
