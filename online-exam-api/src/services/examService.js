'use strict';

const { v4: uuidv4 } = require('uuid');

const { exams: examRepository, questions: questionRepository } = require('../repositories');
const ApiError = require('../utils/ApiError');

// Strip correctAnswerIndex from questions before exposing to non-admins
const stripAnswers = (questions) =>
  questions.map((q) => {
    // eslint-disable-next-line no-unused-vars
    const { correctAnswerIndex, ...safe } = q;
    return safe;
  });

const createExam = async (data) => {
  const now = new Date().toISOString();
  const exam = {
    id: uuidv4(),
    title: data.title,
    description: data.description || '',
    duration: data.duration,
    passingScore: data.passingScore,
    status: data.status || 'DRAFT',
    questionMode: data.questionMode || 'fixed',
    fixedQuestions: data.fixedQuestions || [],
    poolSettings: data.poolSettings || {},
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    subject: data.subject || '',
    batches: data.batches || [],
    createdAt: now,
    updatedAt: now,
  };
  return examRepository.create(exam);
};

const getExamById = async (id, { includeAnswers = false } = {}) => {
  const exam = await examRepository.findById(id);
  if (!exam) return null;
  
  let questions = [];
  if (exam.questionMode === 'fixed' && exam.fixedQuestions?.length > 0) {
    const qs = await Promise.all(exam.fixedQuestions.map(qid => questionRepository.findById(qid)));
    questions = qs.filter(Boolean);
  } else if (exam.questionMode === 'pool') {
    // For pool mode, just fetch some questions matching criteria for now
    const allQs = await questionRepository.listAll();
    questions = allQs.filter(q => {
      if (exam.poolSettings?.topic && q.topic !== exam.poolSettings.topic && !q.tags?.includes(exam.poolSettings.topic)) return false;
      if (exam.poolSettings?.difficulty && q.difficulty !== exam.poolSettings.difficulty) return false;
      return true;
    }).slice(0, exam.poolSettings?.size || 10);
  } else {
    questions = await questionRepository.findByExam(id);
  }
  
  return { ...exam, questions: includeAnswers ? questions : stripAnswers(questions) };
};

const requireExam = async (id) => {
  const exam = await examRepository.findById(id);
  if (!exam) throw ApiError.notFound('Exam not found');
  return exam;
};

const getAllExams = async () => examRepository.list();

const updateExam = async (id, data) => {
  const updated = await examRepository.update(id, data);
  if (!updated) throw ApiError.notFound('Exam not found');
  return updated;
};

const deleteExam = async (id) => {
  const deleted = await examRepository.delete(id);
  if (!deleted) throw ApiError.notFound('Exam not found');
  await questionRepository.deleteByExam(id);
  return true;
};

module.exports = {
  createExam,
  getExamById,
  requireExam,
  getAllExams,
  updateExam,
  deleteExam,
};
