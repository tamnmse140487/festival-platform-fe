import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);


export const festivalAPI = {
  getAll: (params) => api.get('/festivals', { params }),
  getById: (id) => api.get(`/festivals/${id}`),
  create: (data) => api.post('/festivals', data),
  update: (id, data) => api.put(`/festivals/${id}`, data),
  delete: (id) => api.delete(`/festivals/${id}`),
  register: (festivalId, data) => api.post(`/festivals/${festivalId}/register`, data),
  getRegistrations: (festivalId) => api.get(`/festivals/${festivalId}/registrations`),
};

export const ingredientAPI = {
  getAll: (params) => api.get('/ingredients', { params }),
  getById: (id) => api.get(`/ingredients/${id}`),
  create: (data) => api.post('/ingredients', data),
  update: (id, data) => api.put(`/ingredients/${id}`, data),
  delete: (id) => api.delete(`/ingredients/${id}`),
  getBySupplier: (supplierId) => api.get(`/ingredients/supplier/${supplierId}`),
};

export const studentGroupAPI = {
  getAll: (params) => api.get('/groups', { params }),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  getMembers: (id) => api.get(`/groups/${id}/members`),
  addMember: (id, data) => api.post(`/groups/${id}/members`, data),
  removeMember: (id, memberId) => api.delete(`/groups/${id}/members/${memberId}`),
  updateBudget: (id, amount) => api.put(`/groups/${id}/budget`, { amount }),
};

export const boothAPI = {
  getAll: (params) => api.get('/booths', { params }),
  getById: (id) => api.get(`/booths/${id}`),
  create: (data) => api.post('/booths', data),
  update: (id, data) => api.put(`/booths/${id}`, data),
  delete: (id) => api.delete(`/booths/${id}`),
  approve: (id) => api.put(`/booths/${id}/approve`),
  reject: (id) => api.put(`/booths/${id}/reject`),
  getMenuItems: (id) => api.get(`/booths/${id}/menu`),
  getByFestival: (festivalId) => api.get(`/booths/festival/${festivalId}`),
};

export const menuItemAPI = {
  getAll: (params) => api.get('/menu-items', { params }),
  getById: (id) => api.get(`/menu-items/${id}`),
  create: (data) => api.post('/menu-items', data),
  update: (id, data) => api.put(`/menu-items/${id}`, data),
  delete: (id) => api.delete(`/menu-items/${id}`),
  getByBooth: (boothId) => api.get(`/menu-items/booth/${boothId}`),
};

export const gameAPI = {
  getAll: (params) => api.get('/games', { params }),
  getById: (id) => api.get(`/games/${id}`),
  create: (data) => api.post('/games', data),
  update: (id, data) => api.put(`/games/${id}`, data),
  delete: (id) => api.delete(`/games/${id}`),
  getQuestions: (id) => api.get(`/games/${id}/questions`),
  play: (id, answers) => api.post(`/games/${id}/play`, { answers }),
  getByBooth: (boothId) => api.get(`/games/booth/${boothId}`),
};

export const pointsAPI = {
  getBalance: () => api.get('/points/balance'),
  getTransactions: (params) => api.get('/points/transactions', { params }),
  transfer: (data) => api.post('/points/transfer', data),
  redeem: (data) => api.post('/points/redeem', data),
};

export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  complete: (id) => api.put(`/orders/${id}/complete`),
  getByBooth: (boothId) => api.get(`/orders/booth/${boothId}`),
};

export const uploadAPI = {
  uploadImage: (file, entityType, entityId) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteImage: (imageId) => api.delete(`/upload/image/${imageId}`),
};

export default api;