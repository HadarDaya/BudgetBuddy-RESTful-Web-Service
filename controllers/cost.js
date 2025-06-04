/**
 * @file Controller functions for handling cost-related operations.
 * Including adding new cost items and generating monthly cost reports for users.
 */

const Cost = require('../models/cost'); // Mongoose model for cost items
const { costCategories } = require('../utils/constants');

/**
 * Add a new cost item to the database.
 * @function addCost
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {object} req.body - Request body JSON containing cost details
 * @param {string} req.body.description - Description of the cost item
 * @param {string} req.body.category - Category of the cost item
 * @param {string} req.body.userid - User ID associated with the cost
 * @param {number} req.body.sum - Cost sum value
 * @param {number} req.body.day - Day of the cost
 * @param {number} req.body.month - Month of the cost
 * @param {number} req.body.year - Year of the cost
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Responds with a JSON object containing the saved cost or an error message
 */
const addCost = async (req, res) => {
    try {
        const { description, category, userid, sum, day, year, month} = req.body;

        // Validate required fields
        if (!description || !category || !userid || !sum) {
            res.status(400).json({ error: 'One or more required parameters are missing' });
            return;
        }

        // Validate userid - must be digits only
        if (!/^\d+$/.test(userid)) {
            res.status(400).json({ error: 'Userid must be a number' });
            return;
        }
        const numericUserId = Number(userid);
        const numericSum = Number(sum);

        // Validate category
        if (!costCategories.includes(category.toLowerCase())) {
            res.status(400).json({ error: `Invalid category. Allowed categories are: ${costCategories.join(', ')}` });
            return;
        }

        // Validate sum
        if (isNaN(numericSum)){
            res.status(400).json({ error: 'Sum must be a number' });
            return;
        }

        // Validate date
        // If any value is undefined or null, default to current date parts
        const validDay = (day !== undefined && day !== null) ? Number(day) : new Date().getDate();
        const validMonth = (month !== undefined && month !== null) ? Number(month) : new Date().getMonth() + 1;
        const validYear = (year !== undefined && year !== null) ? Number(year) : new Date().getFullYear();

        // Validate full date is real and valid
        const fullDate = new Date(validYear, validMonth - 1, validDay);
        // in case date is invalid, the properties will become nan
        if(fullDate.getFullYear() !== validYear || fullDate.getMonth() !== validMonth - 1 || fullDate.getDate() !== validDay) {
            res.status(400).json({ error: 'Invalid date' });
            return;
        }

        // Create cost object with validated data
        const newCost = new Cost({
            description,
            category: category.toLowerCase(),
            userid: numericUserId,
            sum: numericSum,
            day: validDay,
            month: validMonth,
            year: validYear
        });

        // Save the cost to the database
        const savedCost = await newCost.save();

        // Respond with a message and the saved cost item
        res
            .status(201)
            .set('Message', 'Cost added successfully')
            .json({ cost: savedCost } );

    } catch (error) {
        console.error('Error adding cost:', error);
        res.status(500).json({ error: 'Internal server error'});
    }
};

/**
 * Retrieve monthly cost report grouped by category for a specific user, filtered by given month and year.
 * @function getMonthlyReport
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {object} req.query - Query parameters containing cost details
 * @param {string} req.query.id - User ID
 * @param {number} req.query.month - Month of the cost
 * @param {number} req.query.year - Year of the cost
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Responds with a JSON object containing the report or an error message
 */
const getMonthlyReport = async (req, res) => {
    try {
        const { id, month, year } = req.query; // corresponding to url parameter names

        // Validate required fields
        if (!id || !month || !year) {
            res.status(400).json({error: 'One or more required parameters are missing'});
            return;
        }
        // Numbers only
        if (!/^\d+$/.test(id) || !/^\d+$/.test(month) || !/^\d+$/.test(year) ) {
            res.status(400).json({error: 'id, month and year must be a number'});
            return;
        }

        // Validate month - range 1-12
        if (month < 1 || month > 12) {
            res.status(400).json({error: 'Month parameter is out of valid range (1-12)'});
            return;
        }

        // Fetch all cost items for a specific user in the specified month and year
        /** @type {Array<Object>} */
        const userCosts = await Cost.find({
            userid: Number (id) ,
            year: Number(year),
            month: Number(month),
        });

        const costs = groupAndFormatCostItems(userCosts);

        // Create final report object
        const report = ({
            userid: Number(id),
            month: Number(month),
            year: Number(year),
            costs
        });

        // Respond with a message and the monthly report
        res
            .status(200)
            .set('Message', 'Monthly report is ready')
            .json(report);

    } catch (error) {
        console.error('Error retrieving monthly report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Groups cost items by category and formats them according to costCategories.
 * @param {Array<Object>} costItems - Array of cost items from the DB.
 * @returns {Array<Object>} - Formatted costs per category.
 */
function groupAndFormatCostItems(costItems) {
    const grouped = {}; // Initialize an empty object for grouping

    costItems.forEach(cost => {
        // If this category is not yet in the grouped object, initialize it with an empty array
        if (!grouped[cost.category]) {
            grouped[cost.category] = [];
        }
        // Push an object (sum, description, day) into the category array
        grouped[cost.category].push({
            sum: cost.sum,
            description: cost.description,
            day: cost.day
        });
    });

    // Format the grouped cost items into an array of category objects
    return costCategories.map(categoryName => ({
        // For each category, create an object where the key is the category name,
        // and the value is the list of cost items in that category (or an empty array if none exist)
        [categoryName]: grouped[categoryName] || []
    }));
}

module.exports = {
    addCost,
    getMonthlyReport
};