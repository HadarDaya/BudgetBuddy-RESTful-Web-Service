/**
 * @file Defines the /api routes.
 */

const express = require('express');
const router = express.Router();
const { retrieveWelcome } = require('../controllers/home');

/**
 * Route for retrieving welcome message
 * @route   GET /api
 */
router.get('/', retrieveWelcome);

module.exports = router;