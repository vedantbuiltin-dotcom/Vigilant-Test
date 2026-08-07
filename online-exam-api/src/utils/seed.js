'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const env = require('../config/env');
const logger = require('../config/logger');
const {
  users: userRepository,
  exams: examRepository,
  questions: questionRepository,
} = require('../repositories');

const seedBypassUser = async () => {
  if (!env.authBypass.enabled) return;
  const { sub, email, name, role } = env.authBypass.user;
  if (await userRepository.findByEmail(email)) return;
  const passwordHash = await bcrypt.hash('bypass-disabled-password', 4);
  await userRepository.create({
    id: sub,
    email,
    name,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  });
  logger.warn(`AUTH_BYPASS enabled - seeded bypass user "${email}" (role=${role}). Do NOT use in production.`);
};

const seed = async () => {
  await seedBypassUser();
  // Default admin
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

  if (!(await userRepository.findByEmail(adminEmail))) {
    const passwordHash = await bcrypt.hash(adminPassword, env.bcryptSaltRounds);
    await userRepository.create({
      id: uuidv4(),
      email: adminEmail,
      name: 'Administrator',
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    logger.info(`Seeded admin user: ${adminEmail}`);
  }

  const superAdminEmail = 'vedantbuiltin@gmail.com';
  if (!(await userRepository.findByEmail(superAdminEmail))) {
    const passwordHash = await bcrypt.hash('vedant_2004', env.bcryptSaltRounds);
    await userRepository.create({
      id: uuidv4(),
      email: superAdminEmail,
      name: 'Super Admin',
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    logger.info(`Seeded super admin user: ${superAdminEmail}`);
  }

  // Default student and demo exam seeding removed upon user request.
};

module.exports = seed;
