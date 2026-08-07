'use strict';

const store = require('./store');

const submissionRepository = {
  findById: async (id) => store.state.submissions.find(s => s.id === id) || null,
  findByUser: async (userId) => store.state.submissions.filter((s) => s.userId === userId),
  findByExamAndUser: async (examId, userId) =>
    store.state.submissions.filter((s) => s.examId === examId && s.userId === userId),
  create: async (submission) => {
    store.state.submissions.push(submission);
    store.save();
    return submission;
  },
  reset: () => {
    store.state.submissions = [];
    store.save();
  },
};

module.exports = submissionRepository;
