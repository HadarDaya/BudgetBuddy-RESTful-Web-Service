/**
 * @file Defines the /api/about routes.
 * Handles requests such as retrieving team members' information.
 */

const express = require('express');
const router = express.Router();

const { getTeamMembers } = require('../controllers/aboutController');

/**
 * Route for retrieving team members' information
 * @route   GET /api/about
 */
router.get('/', getTeamMembers);

module.exports = router;