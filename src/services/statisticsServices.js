import api from "./api";

export const statisticServices = {
  getAdminSummary: (params) =>
    api.get("/statistics/admin/summary", { params }),

  getAdminPaymentMix: (params) =>
    api.get("/statistics/admin/payment-mix", { params }),

  getAdminTopFestivals: (params) =>
    api.get("/statistics/admin/top-festivals", { params }),

  getSchoolSummary: (params) =>
    api.get("/statistics/school/summary", { params }),

  getSchoolMenuMix: (params) =>
    api.get("/statistics/school/menu-mix", { params }),

  getSchoolFestivalPerformance: (params) =>
    api.get("/statistics/school/festival-performance", { params }),

  getSchoolBoothFunnel: (params) =>
    api.get("/statistics/school/booth-funnel", { params }),

  getRevenueSeries: (params) =>
    api.get("/statistics/revenue-series", { params }),

  getTopBooths: (params) =>
    api.get("/statistics/top-booths", { params }),

  getRecentOrders: (params) =>
    api.get("/statistics/recent-orders", { params }),

  getAlerts: (params) =>
    api.get("/statistics/alerts", { params }),
};
