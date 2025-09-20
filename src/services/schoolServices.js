import api from "./api";

export const schoolServices = {
  get: (params) => api.get("/schools/search", { params }),
  create: (data) => api.post("/schools/create", data),
  update: (params) => api.put(`/schools/update`, {}, { params }),
  delete: (params) => api.delete(`/schools/delete`, { params }),

  async getAccountIdBySchoolId(schoolId) {
    const response = await this.get({ id: schoolId });
    const targetId = String(schoolId);

    if (Array.isArray(response?.data)) {
      return (
        response.data.find((s) => String(s.schoolId) === targetId)?.accountId ??
        null
      );
    }
    return null;
  },
};
