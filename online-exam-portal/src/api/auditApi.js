import apiClient from './client';

export const auditApi = {
  getAuditLog: async (params) => {
    // params can include adminId, actionType, examId, startDate, endDate, page, limit
    const res = await apiClient.get('/admin/audit-log', { params });
    return res.data; // expects { logs: [...], total: number, page: number, totalPages: number }
  }
};
