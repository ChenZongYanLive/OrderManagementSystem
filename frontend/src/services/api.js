import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Order API
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  getStatistics: () => api.get('/orders/statistics'),
};

// Import API
export const importAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getLogs: (params) => api.get('/import/logs', { params }),
  getLogByBatchId: (batchId) => api.get(`/import/logs/${batchId}`),
};

export default api;
