'use strict';

const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const monitorController = require('../controllers/monitorController');
const resultsController = require('../controllers/resultsController');
const auditController = require('../controllers/auditController');
const asyncHandler = require('../middleware/asyncHandler');

const router = Router();

// All admin routes are protected
router.use(authenticate);
router.use(requireAdmin);

router.get('/audit-log', asyncHandler(auditController.getAuditLog));
router.get('/dashboard-summary', asyncHandler(adminController.getDashboardSummary));

// -- Results Routes --
router.get('/results/:examId/summary', asyncHandler(resultsController.getSummary));
router.get('/results/:examId', asyncHandler(resultsController.getList));
router.get('/results/:examId/student/:studentId', asyncHandler(resultsController.getStudentReport));
router.get('/results/:examId/analytics', asyncHandler(resultsController.getAnalytics));
router.post('/results/:examId/release', asyncHandler(resultsController.releaseResults));

// -- Live Monitor Routes --
router.get('/monitor/attempts', asyncHandler(monitorController.getAttempts));
router.post('/monitor/broadcast', asyncHandler(monitorController.broadcast));
router.post('/monitor/force-submit', asyncHandler(monitorController.forceSubmit));
router.post('/monitor/extend-time', asyncHandler(monitorController.extendTime));

// -- Mock Roster Routes --
router.get('/students', asyncHandler(adminController.listStudents));
router.post('/students', asyncHandler(adminController.createStudent));
router.put('/students/:id', asyncHandler(adminController.updateStudent));
router.delete('/students/:id', asyncHandler(adminController.removeStudent));
router.put('/students/:id/batch', asyncHandler(adminController.reassignBatch));
router.post('/students/bulk-import', asyncHandler(adminController.bulkImportStudents));

router.get('/batches', asyncHandler(adminController.listBatches));
router.post('/batches', asyncHandler(adminController.createBatch));
router.put('/batches/:id', asyncHandler(adminController.updateBatch));
router.delete('/batches/:id', asyncHandler(adminController.removeBatch));

router.get('/admins', asyncHandler(adminController.listAdmins));
router.post('/admins', asyncHandler(adminController.createAdmin));
router.delete('/admins/:id', asyncHandler(adminController.removeAdmin));

module.exports = router;
