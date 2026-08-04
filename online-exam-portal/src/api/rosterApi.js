import apiClient from './client';

export const rosterApi = {
  // Students
  listStudents: async () => {
    const res = await apiClient.get('/admin/students');
    return res.data.students || [];
  },
  createStudent: async (data) => {
    const res = await apiClient.post('/admin/students', data);
    return res.data.student;
  },
  updateStudent: async (id, data) => {
    const res = await apiClient.put(`/admin/students/${id}`, data);
    return res.data.student;
  },
  removeStudent: async (id) => {
    const res = await apiClient.delete(`/admin/students/${id}`);
    return res.data;
  },
  reassignBatch: async (studentId, batchId) => {
    const res = await apiClient.put(`/admin/students/${studentId}/batch`, { batchId });
    return res.data.student;
  },
  bulkImportStudents: async (formData) => {
    const res = await apiClient.post('/admin/students/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Batches
  listBatches: async () => {
    const res = await apiClient.get('/admin/batches');
    return res.data.batches || [];
  },
  createBatch: async (data) => {
    const res = await apiClient.post('/admin/batches', data);
    return res.data.batch;
  },
  updateBatch: async (id, data) => {
    const res = await apiClient.put(`/admin/batches/${id}`, data);
    return res.data.batch;
  },
  removeBatch: async (id) => {
    const res = await apiClient.delete(`/admin/batches/${id}`);
    return res.data;
  }
};
