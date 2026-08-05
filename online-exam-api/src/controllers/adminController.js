'use strict';

const examService = require('../services/examService');
const repositories = require('../repositories');

const getDashboardSummary = async (_req, res) => {
  const allExams = await examService.getAllExams();
  
  // Mock logic for dashboard overview based on actual memory store data
  const liveExams = allExams.map(exam => ({
    id: exam.id,
    title: exam.title,
    status: 'PUBLISHED',
    activeStudentCount: Math.floor(Math.random() * 20) + 1, // Mocked live students
    questionCount: exam.questions?.length || 10,
    endsAt: 'in 45 min'
  }));

  const examsLiveCount = liveExams.length;
  const studentsTestingCount = liveExams.reduce((sum, exam) => sum + exam.activeStudentCount, 0);
  const flagsLastHourCount = Math.floor(Math.random() * 5); // Mocked
  const pendingGradingCount = Math.floor(Math.random() * 10); // Mocked

  res.json({
    success: true,
    summary: {
      examsLiveCount,
      studentsTestingCount,
      flagsLastHourCount,
      pendingGradingCount,
      liveExams
    }
  });
};

// -- Mock Store for Roster UI --
let mockBatches = [
  { id: 'b1', name: 'Spring 2026 CS' },
  { id: 'b2', name: 'Fall 2026 Engineering' }
];

let mockStudents = [
  { id: 's1', fullName: 'Alice Johnson', email: 'alice@example.com', batchId: 'b1', batchName: 'Spring 2026 CS' },
  { id: 's2', fullName: 'Bob Smith', email: 'bob@example.com', batchId: 'b2', batchName: 'Fall 2026 Engineering' }
];

const listStudents = (req, res) => res.json({ success: true, students: mockStudents });
const createStudent = (req, res) => {
  const newStudent = { id: Date.now().toString(), ...req.body };
  if (req.body.batchId) {
    const b = mockBatches.find(b => b.id === req.body.batchId);
    if (b) newStudent.batchName = b.name;
  }
  mockStudents.push(newStudent);
  res.json({ success: true, student: newStudent });
};
const updateStudent = (req, res) => {
  const index = mockStudents.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    mockStudents[index] = { ...mockStudents[index], ...req.body };
    if (req.body.batchId) {
      const b = mockBatches.find(b => b.id === req.body.batchId);
      if (b) mockStudents[index].batchName = b.name;
    }
    res.json({ success: true, student: mockStudents[index] });
  } else {
    res.status(404).json({ success: false });
  }
};
const removeStudent = (req, res) => {
  mockStudents = mockStudents.filter(s => s.id !== req.params.id);
  res.json({ success: true });
};
const reassignBatch = (req, res) => {
  const index = mockStudents.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    mockStudents[index].batchId = req.body.batchId;
    const b = mockBatches.find(b => b.id === req.body.batchId);
    if (b) mockStudents[index].batchName = b.name;
    res.json({ success: true, student: mockStudents[index] });
  } else {
    res.status(404).json({ success: false });
  }
};
const bulkImportStudents = (req, res) => {
  if (req.body && req.body.students && Array.isArray(req.body.students)) {
    const imported = [];
    for (const s of req.body.students) {
      // Find or create batch
      const bName = s.batchName || 'Unassigned';
      let batch = mockBatches.find(b => b.name.toLowerCase() === bName.toLowerCase());
      if (!batch) {
        batch = { id: 'b' + Date.now().toString() + Math.floor(Math.random() * 1000), name: bName };
        mockBatches.push(batch);
      }
      
      const newStudent = {
        id: 's' + Date.now().toString() + Math.floor(Math.random() * 1000),
        fullName: s.fullName,
        email: s.email,
        batchId: batch.id,
        batchName: batch.name
      };
      mockStudents.push(newStudent);
      imported.push(newStudent);
    }
    return res.json({ success: true, totalImported: imported.length, totalFailed: 0, errors: [] });
  }

  res.json({ success: false, totalImported: 0, totalFailed: 1, errors: [{ reason: 'No students provided in body' }] });
};

const listBatches = (req, res) => res.json({ success: true, batches: mockBatches });
const createBatch = (req, res) => {
  const newBatch = { id: Date.now().toString(), ...req.body };
  mockBatches.push(newBatch);
  res.json({ success: true, batch: newBatch });
};
const updateBatch = (req, res) => {
  const index = mockBatches.findIndex(b => b.id === req.params.id);
  if (index !== -1) {
    mockBatches[index] = { ...mockBatches[index], ...req.body };
    res.json({ success: true, batch: mockBatches[index] });
  } else {
    res.status(404).json({ success: false });
  }
};
const removeBatch = (req, res) => {
  mockBatches = mockBatches.filter(b => b.id !== req.params.id);
  res.json({ success: true });
};

module.exports = {
  getDashboardSummary,
  listStudents, createStudent, updateStudent, removeStudent, reassignBatch, bulkImportStudents,
  listBatches, createBatch, updateBatch, removeBatch
};
