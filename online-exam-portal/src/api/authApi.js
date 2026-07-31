import apiClient from './client';

export const authApi = {
  login: ({ email, password }) =>
    apiClient.post('/auth/login', { email, password }).then((r) => r.data),

  register: ({ email, password, name }) =>
    apiClient.post('/auth/register', { email, password, name }).then((r) => r.data),

  me: () => apiClient.get('/auth/me').then((r) => r.data),

  refresh: () => apiClient.post('/auth/refresh').then((r) => r.data),
};
