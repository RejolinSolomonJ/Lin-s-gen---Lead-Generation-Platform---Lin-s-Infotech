import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

// Leads
export const leadsAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.patch(`/leads/${id}`, data),
  updateStatus: (id, status) => api.patch(`/leads/${id}/status`, { status }),
  delete: (id) => api.delete(`/leads/${id}`),
  export: (params) => api.get('/leads/export', { params, responseType: 'blob' }),
  getStats: () => api.get('/leads/stats'),
  getTeamPerformance: (timeframe) => api.get('/leads/team-performance', { params: { timeframe } }),
  sendOutreach: (id, data) => api.post(`/leads/${id}/outreach`, data),
  getOutreachConfig: () => api.get('/leads/outreach/config'),
};

// Scanning
export const scanAPI = {
  scanLead: (leadId) => api.post(`/scan/${leadId}`),
  scanSEO: (url) => api.post('/scan/seo', { url }),
  scanPageSpeed: (url) => api.post('/scan/pagespeed', { url }),
};

// Enrichment
export const enrichAPI = {
  enrichLead: (leadId) => api.post(`/enrich/${leadId}`),
};

// Sourcing
export const sourcingAPI = {
  discover: (data) => api.post('/sourcing/discover', data),
};

// Jobs
export const jobsAPI = {
  scanAll: () => api.post('/jobs/scan-all'),
  enrichAll: () => api.post('/jobs/enrich-all'),
  getLogs: (limit) => api.get('/jobs/logs', { params: { limit } }),
};

export default api;
