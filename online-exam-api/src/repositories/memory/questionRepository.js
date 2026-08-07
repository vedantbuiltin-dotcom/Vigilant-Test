'use strict';

const store = require('./store');

const questionRepository = {
  findById: async (id) => store.state.questions.find(q => q.id === id) || null,
  listAll: async () => store.state.questions,
  findByExam: async (examId) => store.state.questions.filter((q) => q.examId === examId),
  create: async (question) => {
    store.state.questions.push(question);
    store.save();
    return question;
  },
  update: async (id, patch) => {
    const existingIndex = store.state.questions.findIndex(q => q.id === id);
    if (existingIndex === -1) return null;
    const merged = { ...store.state.questions[existingIndex], ...patch, id, updatedAt: new Date().toISOString() };
    store.state.questions[existingIndex] = merged;
    store.save();
    return merged;
  },
  delete: async (id) => {
    const existingIndex = store.state.questions.findIndex(q => q.id === id);
    if (existingIndex !== -1) {
      store.state.questions.splice(existingIndex, 1);
      store.save();
      return true;
    }
    return false;
  },
  deleteByExam: async (examId) => {
    const initialLength = store.state.questions.length;
    store.state.questions = store.state.questions.filter(q => q.examId !== examId);
    store.save();
    return initialLength - store.state.questions.length;
  },
  reset: () => {
    store.state.questions = [];
    store.save();
  },
};

module.exports = questionRepository;
