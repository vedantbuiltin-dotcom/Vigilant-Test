'use strict';

const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const asyncHandler = require('../middleware/asyncHandler');

const router = Router();

// All admin routes are protected
router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard-summary', asyncHandler(adminController.getDashboardSummary));

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

module.exports = router;
