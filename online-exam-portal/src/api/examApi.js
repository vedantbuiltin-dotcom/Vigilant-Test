import apiClient from './client';

export const examApi = {
  list: () => apiClient.get('/exams').then((r) => r.data.exams || []),

  get: (id) => apiClient.get(`/exams/${id}`).then((r) => r.data.exam),

  create: (payload) => apiClient.post('/exams', payload).then((r) => r.data.exam),

  update: (id, payload) => apiClient.put(`/exams/${id}`, payload).then((r) => r.data.exam),

  remove: (id) => apiClient.delete(`/exams/${id}`).then((r) => r.data),

  questions: (examId) =>
    apiClient.get(`/questions/exam/${examId}`).then((r) => r.data.questions || []),
};
