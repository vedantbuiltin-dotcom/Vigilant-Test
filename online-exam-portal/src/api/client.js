import axios from 'axios';
import config from '../config';
import { getToken, clearAuth } from '../utils/storage';

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // Don't bounce to /login when AUTH_BYPASS is on - the API should already accept the request.
    if (status === 401 && !config.authBypass) {
      clearAuth();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    const message =
      error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Request failed';
    const apiError = new Error(message);
    apiError.status = status;
    apiError.details = error.response?.data?.error?.details;
    return Promise.reject(apiError);
  },
);

export default apiClient;
