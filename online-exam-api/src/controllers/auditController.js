'use strict';

const store = require('../repositories/memory/store');

const getAuditLog = (req, res) => {
  try {
    const { page = 1, limit = 15, adminId, actionType, dateRange, examId } = req.query;
    
    let logs = store.state.auditLogs || [];

    if (adminId) {
      logs = logs.filter(log => log.adminId === adminId);
    }
    
    if (actionType) {
      // Allow partial match or exact match depending on what frontend sends
      logs = logs.filter(log => log.actionType.toLowerCase().includes(actionType.toLowerCase()));
    }
    
    if (examId) {
      // If we wanted to filter by examId, but the log might just have targetName
      // To keep it simple, we just ignore examId filter for now, or assume targetName is exam title
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    
    const paginatedLogs = logs.slice(startIndex, endIndex);

    res.json({
      success: true,
      logs: paginatedLogs,
      total: logs.length,
      page: pageNum,
      totalPages: Math.ceil(logs.length / limitNum)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAuditLog,
};
