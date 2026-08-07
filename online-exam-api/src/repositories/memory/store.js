'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('../../config/logger');

const dataFile = path.join(__dirname, '../../..', 'data.json');

const store = {
  state: {
    users: [],
    exams: [],
    questions: [],
    submissions: [],
    batches: [],
    students: [],
    auditLogs: [],
  },
  
  load: () => {
    try {
      if (fs.existsSync(dataFile)) {
        const rawData = fs.readFileSync(dataFile, 'utf8');
        const parsed = JSON.parse(rawData);
        // Ensure all arrays exist
        store.state = { ...store.state, ...parsed };
      }
    } catch (err) {
      logger.error('Failed to load data.json', err);
    }
  },
  
  save: () => {
    try {
      fs.writeFileSync(dataFile, JSON.stringify(store.state, null, 2), 'utf8');
    } catch (err) {
      logger.error('Failed to save data.json', err);
    }
  },

  reset: () => {
    store.state = {
      users: [],
      exams: [],
      questions: [],
      submissions: [],
      batches: [],
      students: [],
      auditLogs: [],
    };
    store.save();
  }
};

// Load initial state on startup
store.load();

module.exports = store;
