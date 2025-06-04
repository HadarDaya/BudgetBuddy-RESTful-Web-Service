/**
 * @file Controller for /api/about routes.
 * Handles retrieving user details.
 */

const teamMembers = [
    { first_name: 'Hadar', last_name: 'Daya' },
    { first_name: 'Yotam', last_name: 'Haimovitch' }
];

/**
 * Retrieve team members' information.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
const getTeamMembers = (req, res) => {
    res
        .status(200)
        .json(teamMembers);
};

module.exports = { getTeamMembers };