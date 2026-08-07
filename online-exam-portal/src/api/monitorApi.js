import apiClient from './client';

export const monitorApi = {
  getExams: async () => {
    const res = await apiClient.get('/exams');
    return res.data.exams || [];
  },
  
  getLiveAttempts: async (examId) => {
    const res = await apiClient.get(`/admin/monitor/attempts?examId=${examId}`);
    return res.data.attempts || [];
  },

  forceSubmit: async (attemptId) => {
    const res = await apiClient.post(`/admin/monitor/force-submit`, { attemptId });
    return res.data;
  },

  extendTime: async (attemptId, minutes) => {
    const res = await apiClient.post(`/admin/monitor/extend-time`, { attemptId, minutes });
    return res.data;
  },

  broadcast: async (examId, message) => {
    const res = await apiClient.post(`/admin/monitor/broadcast`, { examId, message });
    return res.data;
  }
};
