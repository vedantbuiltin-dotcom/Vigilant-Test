'use strict';

const socketHandler = require('../socketHandler');

const getAttempts = (req, res) => {
  const { examId } = req.query;
  if (!examId) return res.status(400).json({ success: false, message: 'examId is required' });
  
  const attempts = socketHandler.getLiveAttempts(examId);
  res.json({ success: true, attempts });
};

const broadcast = (req, res) => {
  const { examId, message } = req.body;
  if (!examId || !message) return res.status(400).json({ success: false, message: 'examId and message are required' });
  
  socketHandler.broadcastToExam(examId, message);
  
  const attempts = socketHandler.getLiveAttempts(examId);
  const sentCount = attempts.filter(a => a.status === 'active').length;
  
  res.json({ success: true, sentCount });
};

const forceSubmit = (req, res) => {
  const { attemptId } = req.body;
  if (!attemptId) return res.status(400).json({ success: false, message: 'attemptId is required' });
  
  socketHandler.forceSubmit(attemptId);
  
  if (req.user) {
    const { logAction } = require('../utils/auditLogger');
    logAction(req.user.sub, req.user.name || 'Admin', 'Force-submitted attempt', `Attempt ID: ${attemptId}`);
  }
  
  res.json({ success: true, message: 'Force submit sent' });
};

const extendTime = (req, res) => {
  const { attemptId, minutes } = req.body;
  if (!attemptId || !minutes) return res.status(400).json({ success: false, message: 'attemptId and minutes are required' });
  
  socketHandler.extendTime(attemptId, minutes);
  
  if (req.user) {
    const { logAction } = require('../utils/auditLogger');
    logAction(req.user.sub, req.user.name || 'Admin', 'Extended exam time', `Added ${minutes} minutes to Attempt ID: ${attemptId}`);
  }
  
  res.json({ success: true, message: 'Time extended' });
};

module.exports = {
  getAttempts,
  broadcast,
  forceSubmit,
  extendTime,
};
