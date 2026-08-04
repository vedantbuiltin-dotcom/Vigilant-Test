import apiClient from './client';

export const questionApi = {
  // Admin-specific question management
  listAdmin: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.topic && filters.topic !== 'all') params.append('topic', filters.topic);
    if (filters.difficulty && filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);

    const res = await apiClient.get(`/api/admin/questions?${params.toString()}`);
    return res.data.questions || [];
  },

  getTopics: async () => {
    const res = await apiClient.get('/api/admin/questions/topics');
    return res.data.topics || [];
  },

  create: async (data) => {
    const res = await apiClient.post('/api/admin/questions', data);
    return res.data.question;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/api/admin/questions/${id}`, data);
    return res.data.question;
  },

  remove: async (id) => {
    const res = await apiClient.delete(`/api/admin/questions/${id}`);
    return res.data;
  },

  bulkImport: async (formData) => {
    const res = await apiClient.post('/api/admin/questions/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};
