/**
 * @file Defines the Cost model schema using Mongoose.
 */

const mongoose= require('mongoose');
const schema = mongoose.Schema;
const { costCategories } = require('../utils/constants');

/**
 * Defines the Mongoose schema for Cost documents in MongoDB
 * @typedef {Object} Cost
 * @property {string} description - Description of the cost item (required)
 * @property {string} category - Category of the cost item.
 *                               Must be one of: 'food', 'health', 'housing', 'sport', 'education' (required)
 * @property {number} userid - The ID of the user associated with this cost (required)
 * @property {number} sum - The amount of the cost (required)
 * @property {Date} date - The date when the cost was added. Defaults to the current date
 */
const costSchema = new schema({
    description:{
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: costCategories,
        lowercase: true
    },
    userid: {
        type: Number,
        required: true
    },
    sum: {
        type: Number,
        required: true,
        min: 0
    },
    day: {
        type: Number,
        default: () => new Date().getDate(),
        min: 1,
        max: 31
    },
    month: {
        type: Number,
        default: () => new Date().getMonth() + 1,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        default: () => new Date().getFullYear()
    }
});

module.exports = mongoose.model('Cost', costSchema);
