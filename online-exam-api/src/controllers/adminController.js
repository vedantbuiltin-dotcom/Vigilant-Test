'use strict';

const examService = require('../services/examService');
const authService = require('../services/authService');
const repositories = require('../repositories');
const env = require('../config/env');
const socketHandler = require('../socketHandler');
const { logAction } = require('../utils/auditLogger');

let store = null;
if (env.repositoryDriver === 'memory') {
  store = require('../repositories/memory/store');
}

const getDashboardSummary = async (_req, res) => {
  const allExams = await examService.getAllExams();
  
  const liveAttempts = socketHandler.getAllLiveAttempts();
  
  const publishedExams = allExams.filter(exam => exam.status?.toLowerCase() === 'published');
  
  const liveExams = publishedExams.map(exam => {
    const activeStudentCount = liveAttempts.filter(a => a.examId === exam.id && a.status === 'active').length;
    
    let endsAtStr = 'N/A';
    if (exam.endTime) {
      const diff = new Date(exam.endTime) - new Date();
      if (diff > 0) {
        endsAtStr = `in ${Math.round(diff / 60000)} min`;
      } else {
        endsAtStr = 'Ended';
      }
    }
    
    return {
      id: exam.id,
      title: exam.title,
      status: exam.resultsReleased ? 'RELEASED' : 'PUBLISHED',
      activeStudentCount,
      questionCount: exam.questions?.length || 0,
      endsAt: endsAtStr
    };
  });

  // Only consider exams "live" if they have active students right now
  const trulyLiveExams = liveExams.filter(e => e.activeStudentCount > 0);

  const examsLiveCount = trulyLiveExams.length;
  const studentsTestingCount = liveAttempts.filter(a => a.status === 'active').length;
  
  const oneHourAgo = new Date(Date.now() - 3600000);
  let flagsLastHourCount = 0;
  liveAttempts.forEach(attempt => {
    if (attempt.flags) {
      attempt.flags.forEach(flag => {
        if (new Date(flag.timestamp) > oneHourAgo) {
          flagsLastHourCount++;
        }
      });
    }
  });

  const pendingGradingCount = 0;

  res.json({
    success: true,
    summary: {
      examsLiveCount,
      studentsTestingCount,
      flagsLastHourCount,
      pendingGradingCount,
      liveExams: trulyLiveExams
    }
  });
};

// -- Mock Store for Roster UI --
// Fallback if not using memory driver but roster is hit (though in memory it uses store)
const fallbackStudents = [];
const fallbackBatches = [];

const getStudents = () => store ? store.state.students : fallbackStudents;
const getBatches = () => store ? store.state.batches : fallbackBatches;
const saveStore = () => { if (store) store.save(); };

const listStudents = (req, res) => res.json({ success: true, students: getStudents() });
const createStudent = async (req, res) => {
  const password = req.body.password || Math.random().toString(36).slice(-8);
  let user;
  try {
    user = await authService.register({
      email: req.body.email,
      name: req.body.fullName || req.body.name || 'Unknown',
      password
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const newStudent = { id: user.id, password, ...req.body };
  if (req.body.batchId) {
    const b = getBatches().find(b => b.id === req.body.batchId);
    if (b) newStudent.batchName = b.name;
  }
  getStudents().push(newStudent);
  saveStore();
  res.json({ success: true, student: newStudent });
};
const updateStudent = (req, res) => {
  const students = getStudents();
  const index = students.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    students[index] = { ...students[index], ...req.body };
    if (req.body.batchId) {
      const b = getBatches().find(b => b.id === req.body.batchId);
      if (b) students[index].batchName = b.name;
    }
    saveStore();
    res.json({ success: true, student: students[index] });
  } else {
    res.status(404).json({ success: false });
  }
};
const removeStudent = async (req, res) => {
  const students = getStudents();
  const index = students.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    const student = students[index];
    students.splice(index, 1);
    saveStore();
    
    const user = await repositories.users.findByEmail(student.email.toLowerCase().trim());
    if (user) {
      await repositories.users.delete(user.id);
    }
  }
  res.json({ success: true });
};
const reassignBatch = (req, res) => {
  const students = getStudents();
  const index = students.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    students[index].batchId = req.body.batchId;
    const b = getBatches().find(b => b.id === req.body.batchId);
    if (b) students[index].batchName = b.name;
    saveStore();
    res.json({ success: true, student: students[index] });
  } else {
    res.status(404).json({ success: false });
  }
};
const bulkImportStudents = async (req, res) => {
  if (req.body && req.body.students && Array.isArray(req.body.students)) {
    const imported = [];
    const batches = getBatches();
    const students = getStudents();
    
    const usersToCreate = req.body.students.map(s => ({
      email: s.email,
      name: s.fullName,
      password: s.password,
      role: 'student'
    }));
    await authService.bulkRegister(usersToCreate);
    
    for (const s of req.body.students) {
      // Find or create batch
      const bName = s.batchName || 'Unassigned';
      let batch = batches.find(b => b.name.toLowerCase() === bName.toLowerCase());
      if (!batch) {
        batch = { id: 'b' + Date.now().toString() + Math.floor(Math.random() * 1000), name: bName };
        batches.push(batch);
      }
      
      const user = await repositories.users.findByEmail(s.email.toLowerCase().trim());
      const studentId = user ? user.id : 's' + Date.now().toString() + Math.floor(Math.random() * 1000);
      
      const existingStudentIdx = students.findIndex(st => st.email.toLowerCase() === s.email.toLowerCase());

      const newStudent = {
        id: studentId,
        fullName: s.fullName,
        email: s.email,
        batchId: batch.id,
        batchName: batch.name,
        password: s.password
      };
      
      if (existingStudentIdx !== -1) {
        students[existingStudentIdx] = newStudent;
      } else {
        students.push(newStudent);
      }
      imported.push(newStudent);
    }
    saveStore();
    
    if (req.user) {
      logAction(req.user.sub, req.user.name || 'Admin', 'Imported students', `${imported.length} students imported`);
    }
    
    return res.json({ success: true, totalImported: imported.length, totalFailed: 0, errors: [] });
  }

  res.json({ success: false, totalImported: 0, totalFailed: 1, errors: [{ reason: 'No students provided in body' }] });
};

const listBatches = (req, res) => {
  const batches = getBatches();
  const students = getStudents();
  const batchesWithCount = batches.map(batch => ({
    ...batch,
    studentCount: students.filter(s => s.batchId === batch.id).length
  }));
  res.json({ success: true, batches: batchesWithCount });
};
const createBatch = (req, res) => {
  const newBatch = { id: Date.now().toString(), ...req.body };
  getBatches().push(newBatch);
  saveStore();
  res.json({ success: true, batch: newBatch });
};
const updateBatch = (req, res) => {
  const batches = getBatches();
  const index = batches.findIndex(b => b.id === req.params.id);
  if (index !== -1) {
    batches[index] = { ...batches[index], ...req.body };
    saveStore();
    res.json({ success: true, batch: batches[index] });
  } else {
    res.status(404).json({ success: false });
  }
};
const removeBatch = (req, res) => {
  const batches = getBatches();
  const index = batches.findIndex(b => b.id === req.params.id);
  if (index !== -1) {
    batches.splice(index, 1);
    saveStore();
  }
  res.json({ success: true });
};

const listAdmins = async (req, res) => {
  const users = await repositories.users.list();
  const admins = users.filter(u => u.role === 'admin');
  res.json({ success: true, admins });
};

const createAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }
  
  const existing = await repositories.users.findByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const newAdmin = {
    id: 'u' + Date.now().toString(),
    name,
    email,
    password, // In a real app, hash this!
    role: 'admin',
    createdAt: new Date().toISOString()
  };

  await repositories.users.create(newAdmin);
  res.json({ success: true, admin: newAdmin });
};

const removeAdmin = async (req, res) => {
  const { id } = req.params;
  
  // Prevent deleting the super admin
  const user = await repositories.users.findById(id);
  if (user && user.email === 'vedantbuiltin@gmail.com') {
    return res.status(403).json({ success: false, message: 'Cannot delete the super admin' });
  }

  await repositories.users.delete(id);
  res.json({ success: true });
};

module.exports = {
  getDashboardSummary,
  listStudents, createStudent, updateStudent, removeStudent, reassignBatch, bulkImportStudents,
  listBatches, createBatch, updateBatch, removeBatch,
  listAdmins, createAdmin, removeAdmin
};
