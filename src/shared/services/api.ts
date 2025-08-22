import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'https://your-api-base-url.com', // Replace with your actual API URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for auth tokens if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods for different resources
export const apiService = {
  // Workers
  workers: {
    getAll: () => api.get('/workers'),
    getById: (id: number) => api.get(`/workers/${id}`),
    create: (data: any) => api.post('/workers', data),
    update: (id: number, data: any) => api.put(`/workers/${id}`, data),
    delete: (id: number) => api.delete(`/workers/${id}`),
  },

  // Projects
  projects: {
    getAll: () => api.get('/projects'),
    getById: (id: number) => api.get(`/projects/${id}`),
    create: (data: any) => api.post('/projects', data),
    update: (id: number, data: any) => api.put(`/projects/${id}`, data),
    delete: (id: number) => api.delete(`/projects/${id}`),
  },

  // Attendance
  attendance: {
    getByDate: (date: string) => api.get(`/attendance?date=${date}`),
    markAttendance: (data: any) => api.post('/attendance', data),
    updateAttendance: (id: number, data: any) => api.put(`/attendance/${id}`, data),
  },

  // Payments
  payments: {
    getByWorker: (workerId: number) => api.get(`/payments?workerId=${workerId}`),
    create: (data: any) => api.post('/payments', data),
    update: (id: number, data: any) => api.put(`/payments/${id}`, data),
  },
};

export default api;
