'use strict';

const logger = require('../config/logger');
const examService = require('../services/examService');

let intervalId = null;

const start = () => {
  if (intervalId) return;

  logger.info('Starting Background Worker: Exam Status Monitor (running every 60s)');
  
  intervalId = setInterval(async () => {
    try {
      const exams = await examService.getAllExams();
      const now = new Date();

      for (const exam of exams) {
        // Only process published exams that have an end date
        if (exam.status?.toLowerCase() === 'published' && exam.endDate) {
          let endDate = new Date(exam.endDate);
          
          // If the date is just YYYY-MM-DD, assume it's valid until the very end of that day
          if (exam.endDate.length === 10) {
            endDate.setUTCHours(23, 59, 59, 999);
          }
          
          if (now > endDate) {
            logger.info(`[WORKER] Auto-closing expired exam: ${exam.title} (${exam.id})`);
            await examService.updateExam(exam.id, { status: 'closed' });
          }
        }
      }
    } catch (err) {
      logger.error('Error in examStatusWorker:', err);
    }
  }, 60 * 1000); // Run every 60 seconds
};

const stop = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('Stopped Background Worker: Exam Status Monitor');
  }
};

module.exports = { start, stop };
