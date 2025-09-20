import { chatApi } from "./api";

export const notificationServices = {
  createByType: (type, payload) =>
    chatApi.post(`/notifications/${type}`, payload),

  getByUser: (userId, options = {}) =>
    chatApi.get("/notifications", {
      params: { user_id: userId, ...options },
    }),

  markOneRead: (notificationId, userId) =>
    chatApi.patch(`/notifications/${notificationId}/read`, { user_id: userId }),

  markAllRead: (userId) =>
    chatApi.patch("/notifications/read-all", { user_id: userId }),

  clearAll: (userId) =>
    chatApi.delete("/notifications/clear", { data: { user_id: userId } }),
};
