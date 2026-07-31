'use strict';

const { v4: uuidv4 } = require('uuid');

const { exams: examRepository, questions: questionRepository } = require('../repositories');
const ApiError = require('../utils/ApiError');

const validateOptions = (options, correctAnswerIndex) => {
  if (correctAnswerIndex >= options.length) {
    throw ApiError.badRequest('correctAnswerIndex out of range for options');
  }
};

const addQuestion = async (data) => {
  const exam = await examRepository.findById(data.examId);
  if (!exam) throw ApiError.notFound('Exam not found');
  if (data.options && data.correctAnswerIndex !== undefined) {
    validateOptions(data.options, data.correctAnswerIndex);
  }

  const question = {
    id: uuidv4(),
    examId: data.examId,
    question: data.question,
    options: data.options || [],
    correctAnswerIndex: data.correctAnswerIndex ?? 0,
    mark: data.mark ?? 1,
    type: data.type || 'MCQ',
    tags: data.tags || [],
    difficulty: data.difficulty || 'medium',
    createdAt: new Date().toISOString(),
  };
  return questionRepository.create(question);
};

const addBulkQuestions = async (examId, questionsData) => {
  const exam = await examRepository.findById(examId);
  if (!exam) throw ApiError.notFound('Exam not found');
  
  const created = [];
  for (const data of questionsData) {
    if (data.options && data.correctAnswerIndex !== undefined) {
      validateOptions(data.options, data.correctAnswerIndex);
    }
    const question = {
      id: uuidv4(),
      examId,
      question: data.question,
      options: data.options || [],
      correctAnswerIndex: data.correctAnswerIndex ?? 0,
      mark: data.mark ?? 1,
      type: data.type || 'MCQ',
      tags: data.tags || [],
      difficulty: data.difficulty || 'medium',
      createdAt: new Date().toISOString(),
    };
    await questionRepository.create(question);
    created.push(question);
  }
  return created;
};

const getQuestionById = async (id) => {
  const question = await questionRepository.findById(id);
  if (!question) throw ApiError.notFound('Question not found');
  return question;
};

const getQuestionsByExam = async (examId) => questionRepository.findByExam(examId);

const updateQuestion = async (id, data) => {
  const existing = await questionRepository.findById(id);
  if (!existing) throw ApiError.notFound('Question not found');

  const next = { ...existing, ...data };
  if (next.options && next.correctAnswerIndex !== undefined) {
    validateOptions(next.options, next.correctAnswerIndex);
  }
  return questionRepository.update(id, data);
};

const deleteQuestion = async (id) => {
  const deleted = await questionRepository.delete(id);
  if (!deleted) throw ApiError.notFound('Question not found');
  return true;
};

module.exports = {
  addQuestion,
  addBulkQuestions,
  getQuestionById,
  getQuestionsByExam,
  updateQuestion,
  deleteQuestion,
};
