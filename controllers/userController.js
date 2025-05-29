/**
 * @file Controller for /api/users routes.
 * Handles retrieving user details.
 */

const User = require('../models/user'); // Mongoose model for users
const Cost = require('../models/cost'); // Mongoose model for cost items

/**
 * Handles requests missing the userId parameter.
 * @function handleMissingUserId
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void}
 */
const handleMissingUserId = (req, res) => {
    res.status(400).json({ error: 'Userid is required' });
};

/**
 * Retrieves a user's full name and total costs based on their ID.
 * Includes validation checkups.
 * @function getUserById
 * @async
 * @param {import('express').Request} req - Express request object, containing the user ID in `req.params.id`
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        // Validate userid - must be digits only
        if (!/^\d+$/.test(userId)) {
            res.status(400).json({ error: 'Userid must be a number' });
            return;
        }
        const numericUserId = Number(userId);

        // Find the user by id
        const user = await User.findOne({ id: numericUserId});

        // Check if the userId exists
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Aggregate total cost for the user
        /** @type {Array<Object>} */
        const costs = await Cost.find({ userid: numericUserId });
        const total = costs.reduce((sum, cost) => sum + cost.sum, 0);

        // Create result object
        const userTotal = ({
            first_name: user.first_name,
            last_name: user.last_name,
            id: numericUserId,
            total
        });

        // Respond with user details and total cost
        res
            .status(200)
            .set('Message', 'User details and total cost report is ready')
            .json(userTotal);

    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getUserById,
    handleMissingUserId
};