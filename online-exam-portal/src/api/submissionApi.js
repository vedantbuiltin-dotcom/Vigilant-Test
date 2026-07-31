import apiClient from './client';

export const submissionApi = {
  submit: (examId, answers) =>
    apiClient.post(`/submissions/exam/${examId}`, { answers }).then((r) => r.data.submission),

  get: (id) => apiClient.get(`/submissions/${id}`).then((r) => r.data.submission),

  mine: () => apiClient.get('/submissions/me').then((r) => r.data.submissions || []),
};
