'use strict';

const store = require('./store');

const userRepository = {
  findByEmail: async (email) => {
    const emailLower = String(email).toLowerCase();
    return store.state.users.find(u => u.email.toLowerCase() === emailLower) || null;
  },
  findById: async (id) => store.state.users.find(u => u.id === id) || null,

  create: async (user) => {
    const stored = { ...user };
    // Check if user already exists
    const existingIndex = store.state.users.findIndex(u => u.id === stored.id || u.email.toLowerCase() === stored.email.toLowerCase());
    if (existingIndex !== -1) {
      store.state.users[existingIndex] = stored;
    } else {
      store.state.users.push(stored);
    }
    store.save();
    return stored;
  },

  list: async () => store.state.users,

  delete: async (id) => {
    const index = store.state.users.findIndex(u => u.id === id);
    if (index !== -1) {
      store.state.users.splice(index, 1);
      store.save();
      return true;
    }
    return false;
  },

  reset: () => {
    store.state.users = [];
    store.save();
  },
};

module.exports = userRepository;
