import api from "./api";

export const accountFestivalWalletsServices = {
  create: (data) => api.post("/accountfestivalwallets/create", data),
  get: (params) => api.get("/accountfestivalwallets/search", { params }),
  delete: (params) => api.delete(`/accountfestivalwallets/delete`, { params }),
  update: (params, data) =>
    api.put(`/accountfestivalwallets/update`, {}, { params }),
  transferToFestivalWallet: (data) =>
    api.post("/accountfestivalwallets/transfer-to-festivalwallet", data),
  transferToWallet: (data) =>
    api.post("/accountfestivalwallets/transfer-to-wallet", data),
};
