'use strict';

const authService = require('../services/authService');

const register = async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ success: true, user });
};

const login = async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, ...result });
};

const refresh = async (req, res) => {
  const result = await authService.refresh(req.user);
  res.json({ success: true, ...result });
};

const me = async (req, res) => {
  const user = await authService.getUserById(req.user.sub);
  res.json({ success: true, user });
};

const bulkRegister = async (req, res) => {
  const { users } = req.body;
  if (!Array.isArray(users)) {
    return res.status(400).json({ success: false, message: 'Invalid bulk data' });
  }
  const created = await authService.bulkRegister(users);
  res.status(201).json({ success: true, count: created.length, users: created });
};

module.exports = { register, login, refresh, me, bulkRegister };
