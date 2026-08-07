'use strict';

const examService = require('../services/examService');
const { logAction } = require('../utils/auditLogger');

const env = require('../config/env');
let store = null;
if (env.repositoryDriver === 'memory') {
  store = require('../repositories/memory/store');
}

const list = async (req, res) => {
  let exams = await examService.getAllExams();
  
  if (req.user?.role === 'student') {
    let batchId = null;
    if (store) {
      const student = store.state.students.find(s => s.email.toLowerCase() === req.user.email.toLowerCase());
      batchId = student?.batchId;
    }
    if (batchId) {
      exams = exams.filter(e => e.status?.toLowerCase() === 'published' && e.batches?.includes(batchId));
    } else {
      exams = [];
    }
  }
  
  res.json({ success: true, exams });
};

const getOne = async (req, res) => {
  const includeAnswers = req.user?.role === 'admin';
  const exam = await examService.getExamById(req.params.id, { includeAnswers });
  if (!exam) return res.status(404).json({ success: false, error: { status: 404, message: 'Exam not found' } });

  if (req.user?.role === 'student') {
    let batchId = null;
    if (store) {
      const student = store.state.students.find(s => s.email.toLowerCase() === req.user.email.toLowerCase());
      batchId = student?.batchId;
    }
    if (!batchId || !exam.batches?.includes(batchId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not assigned to this exam batch.' });
    }
    if (exam.status?.toLowerCase() !== 'published') {
      return res.status(403).json({ success: false, message: 'Forbidden: This exam is not currently published.' });
    }
  }

  return res.json({ success: true, exam });
};

const create = async (req, res) => {
  const exam = await examService.createExam(req.body);
  if (req.user) {
    logAction(req.user.sub, req.user.name || 'Admin', 'Created exam', exam.title);
  }
  res.status(201).json({ success: true, exam });
};

const update = async (req, res) => {
  const exam = await examService.updateExam(req.params.id, req.body);
  if (req.user) {
    const actionType = req.body.status === 'published' ? 'Published exam' : 'Updated exam';
    logAction(req.user.sub, req.user.name || 'Admin', actionType, exam.title);
  }
  res.json({ success: true, exam });
};

const remove = async (req, res) => {
  const exam = await examService.getExamById(req.params.id);
  await examService.deleteExam(req.params.id);
  if (req.user && exam) {
    logAction(req.user.sub, req.user.name || 'Admin', 'Deleted exam', exam.title);
  }
  res.json({ success: true, message: 'Exam deleted' });
};

module.exports = { list, getOne, create, update, remove };
