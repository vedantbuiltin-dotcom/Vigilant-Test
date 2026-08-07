'use strict';

const store = require('./store');

const examRepository = {
  findById: async (id) => store.state.exams.find(e => e.id === id) || null,
  list: async () => store.state.exams,
  create: async (exam) => {
    store.state.exams.push(exam);
    store.save();
    return exam;
  },
  update: async (id, patch) => {
    const existingIndex = store.state.exams.findIndex(e => e.id === id);
    if (existingIndex === -1) return null;
    const merged = { ...store.state.exams[existingIndex], ...patch, id, updatedAt: new Date().toISOString() };
    store.state.exams[existingIndex] = merged;
    store.save();
    return merged;
  },
  delete: async (id) => {
    const existingIndex = store.state.exams.findIndex(e => e.id === id);
    if (existingIndex !== -1) {
      store.state.exams.splice(existingIndex, 1);
      store.save();
      return true;
    }
    return false;
  },
  reset: () => {
    store.state.exams = [];
    store.save();
  },
};

module.exports = examRepository;
