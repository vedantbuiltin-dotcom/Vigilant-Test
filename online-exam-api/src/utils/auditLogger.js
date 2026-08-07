'use strict';

const { v4: uuidv4 } = require('uuid');
const store = require('../repositories/memory/store');

/**
 * Logs an administrative action to the audit log.
 * @param {string} adminId - The ID of the admin performing the action
 * @param {string} adminName - The name of the admin (for display)
 * @param {string} actionType - E.g. 'PUBLISHED_EXAM', 'RELEASED_RESULTS', 'FORCE_SUBMITTED_ATTEMPT'
 * @param {string} targetName - The name of the exam or student affected
 * @param {string} [details] - Optional extra details (e.g. 'Reason: question 4 had a wrong answer key')
 */
const logAction = (adminId, adminName, actionType, targetName, details = null) => {
  const logEntry = {
    id: uuidv4(),
    adminId,
    adminName,
    actionType,
    targetName,
    details,
    timestamp: new Date().toISOString(),
  };

  store.state.auditLogs.unshift(logEntry); // add to top
  store.save();
};

module.exports = {
  logAction,
};
