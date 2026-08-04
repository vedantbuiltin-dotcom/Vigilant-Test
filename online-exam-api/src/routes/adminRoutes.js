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

module.exports = router;
