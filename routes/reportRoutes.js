/**
 * @file Defines the /api/report routes.
 * Handles requests of retrieving monthly cost report.
 */

const express = require('express');
const router = express.Router();
const { getMonthlyReport } = require('../controllers/costController');

/**
 * Route for retrieving monthly cost report, grouped by category for a specific user, filtered by given month and year.
 * @route   GET /api/report
 */
router.get('/', getMonthlyReport);

module.exports = router;