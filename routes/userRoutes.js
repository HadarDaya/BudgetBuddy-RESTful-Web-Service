/**
 * @file Defines the /api/users routes.
 * Handles user-related requests, such as retrieving user details.
 */

const express = require('express');
const router = express.Router();
const { getUserById, handleMissingUserId } = require('../controllers/userController');

/**
 * Route for handling missing user id
 * @route   GET /api/users
 */
router.get('/', handleMissingUserId);

/**
 * Route for retrieving a user's full name and total costs based on their ID.
 * @route   GET /api/users/:id
 */
router.get('/:id', getUserById);

module.exports = router;