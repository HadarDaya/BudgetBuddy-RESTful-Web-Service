/**
 * @file Defines the User model schema using Mongoose.
 */

const mongoose= require('mongoose');
const schema = mongoose.Schema;
const { maritalStatuses } = require('../utils/constants');

/**
 * Defines the Mongoose schema for User documents in MongoDB
 * @typedef {Object} User
 * @property {number} id - Unique user ID (required)
 * @property {string} first_name - First name of the user (required)
 * @property {string} last_name - Last name of the user (required)
 * @property {Date} birthday - Date of birth of the user
 * @property {string} marital_status - Marital status of the user. (Must be one of values in enum)
 */
const userSchema = new schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    birthday: {
        type: Date
    },
    marital_status: {
        type: String,
        enum: maritalStatuses
    }
});

module.exports = mongoose.model('User', userSchema);