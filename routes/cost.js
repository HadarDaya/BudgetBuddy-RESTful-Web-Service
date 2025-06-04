/**
 * @file Defines the /api/add routes.
 * Handles requests of adding a new cost item to db.
 */

const express = require('express');
const router = express.Router();
const { addCost } = require('../controllers/cost');

/**
 * Route for adding a new cost item to db
 * @route   GET /api/add
 */
router.post('/', addCost);

module.exports = router;