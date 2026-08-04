'use strict';

const examService = require('../services/examService');
const repositories = require('../repositories');

const getDashboardSummary = async (_req, res) => {
  const allExams = await examService.getAllExams();
  
  // Mock logic for dashboard overview based on actual memory store data
  const liveExams = allExams.map(exam => ({
    id: exam.id,
    title: exam.title,
    status: 'PUBLISHED',
    activeStudentCount: Math.floor(Math.random() * 20) + 1, // Mocked live students
    questionCount: exam.questions?.length || 10,
    endsAt: 'in 45 min'
  }));

  const examsLiveCount = liveExams.length;
  const studentsTestingCount = liveExams.reduce((sum, exam) => sum + exam.activeStudentCount, 0);
  const flagsLastHourCount = Math.floor(Math.random() * 5); // Mocked
  const pendingGradingCount = Math.floor(Math.random() * 10); // Mocked

  res.json({
    success: true,
    summary: {
      examsLiveCount,
      studentsTestingCount,
      flagsLastHourCount,
      pendingGradingCount,
      liveExams
    }
  });
};

module.exports = {
  getDashboardSummary
};
