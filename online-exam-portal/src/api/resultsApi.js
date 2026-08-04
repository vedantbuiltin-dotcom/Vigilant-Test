import apiClient from './client';

export const resultsApi = {
  getSummary: async (examId) => {
    const res = await apiClient.get(`/admin/results/${examId}/summary`);
    return res.data;
  },
  
  getList: async (examId) => {
    const res = await apiClient.get(`/admin/results/${examId}`);
    return res.data.results || [];
  },

  getStudentReport: async (examId, studentId) => {
    const res = await apiClient.get(`/admin/results/${examId}/student/${studentId}`);
    return res.data;
  },

  getAnalytics: async (examId) => {
    const res = await apiClient.get(`/admin/results/${examId}/analytics`);
    return res.data;
  },

  releaseResults: async (examId) => {
    const res = await apiClient.post(`/admin/results/${examId}/release`);
    return res.data;
  }
};
