'use strict';

const examService = require('../services/examService');
const store = require('../repositories/memory/store');

const getSubmissionsForExam = (examId) => {
  return store.state.submissions.filter(s => s.examId === examId);
};

const getStudentName = (userId) => {
  const user = store.state.users.find(u => u.id === userId);
  return user ? user.name : 'Unknown Student';
};

const getSummary = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await examService.getExamById(examId, { includeAnswers: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const submissions = getSubmissionsForExam(examId);
    
    let totalScore = 0;
    let passedCount = 0;
    
    submissions.forEach(sub => {
      totalScore += sub.percentage || 0;
      if (sub.passed) passedCount++;
    });

    const averageScore = submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;
    const passRate = submissions.length > 0 ? Math.round((passedCount / submissions.length) * 100) : 0;
    
    const summary = {
      title: exam.title,
      averageScore: `${averageScore}%`,
      passRate: `${passRate}%`,
      pendingGrading: 0, // Mocked for now
      status: exam.resultsReleased ? 'Released' : 'Pending',
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getList = async (req, res) => {
  try {
    const { examId } = req.params;
    const submissions = getSubmissionsForExam(examId);
    
    const results = submissions.map(sub => ({
      studentId: sub.userId,
      studentName: getStudentName(sub.userId),
      scoreRaw: sub.score,
      scorePercent: sub.percentage,
      passed: sub.passed,
      timeTaken: 'N/A', // Assuming not tracked perfectly in submission
      flags: sub.flags || 0,
    }));

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStudentReport = async (req, res) => {
  try {
    const { examId, studentId } = req.params;
    const exam = await examService.getExamById(examId, { includeAnswers: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const submission = store.state.submissions.find(s => s.examId === examId && s.userId === studentId);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    const answers = submission.details.map(detail => {
      const question = exam.questions.find(q => q.id === detail.questionId);
      return {
        questionId: detail.questionId,
        questionText: question ? question.text : 'Unknown question',
        selectedAnswer: detail.selectedIndex,
        correctAnswer: detail.correctIndex,
        isCorrect: detail.isCorrect,
        pointsEarned: detail.isCorrect ? detail.mark : 0,
        pointsPossible: detail.mark,
      };
    });

    const report = {
      studentName: getStudentName(studentId),
      score: submission.score,
      percentage: submission.percentage,
      passed: submission.passed,
      submittedAt: submission.submittedAt,
      answers,
    };

    res.json(report);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { examId } = req.params;
    const submissions = getSubmissionsForExam(examId);
    
    // Default distributions
    const scoreDistribution = {
      '0-59': 0,
      '60-69': 0,
      '70-79': 0,
      '80-89': 0,
      '90-100': 0,
    };
    
    submissions.forEach(sub => {
      const p = sub.percentage || 0;
      if (p < 60) scoreDistribution['0-59']++;
      else if (p < 70) scoreDistribution['60-69']++;
      else if (p < 80) scoreDistribution['70-79']++;
      else if (p < 90) scoreDistribution['80-89']++;
      else scoreDistribution['90-100']++;
    });

    // Mock question performance for now
    const questionPerformance = [];

    res.json({ scoreDistribution, questionPerformance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const releaseResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const examIndex = store.state.exams.findIndex(e => e.id === examId);
    if (examIndex === -1) return res.status(404).json({ success: false, message: 'Exam not found' });

    store.state.exams[examIndex].resultsReleased = true;
    store.save();

    if (req.user) {
      const { logAction } = require('../utils/auditLogger');
      logAction(req.user.sub, req.user.name || 'Admin', 'Released results', store.state.exams[examIndex].title);
    }

    res.json({ success: true, message: 'Results released' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSummary,
  getList,
  getStudentReport,
  getAnalytics,
  releaseResults,
};
