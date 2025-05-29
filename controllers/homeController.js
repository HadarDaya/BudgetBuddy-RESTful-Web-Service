/**
 * @file Controller for /api routes.
 */

/**
 * Retrieve welcome message
 * @function retrieveWelcome
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} Sends a welcome message as response.
 */
const retrieveWelcome = async (req, res) => {
    res.send('Welcome to BudgetBuddy Cost Manager API!');
};

module.exports = { retrieveWelcome };