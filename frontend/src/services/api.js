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

// Field Mapping API
export const fieldMappingAPI = {
  // Templates
  getTemplates: (params) => api.get('/field-mapping/templates', { params }),
  getTemplateById: (id) => api.get(`/field-mapping/templates/${id}`),
  createTemplate: (data) => api.post('/field-mapping/templates', data),
  updateTemplate: (id, data) => api.put(`/field-mapping/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/field-mapping/templates/${id}`),
  setDefaultTemplate: (id, fileType) =>
    api.post(`/field-mapping/templates/${id}/set-default`, { file_type: fileType }),

  // Preview
  previewFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/field-mapping/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // System fields
  getSystemFields: () => api.get('/field-mapping/system-fields'),
};

export default api;
