/**
* @file Entry point of the Cost Manager application.
* Sets up Express server, connects to MongoDB, and initializes routes and middleware.
* Includes settings for global Pretty-print JSON responses
*/
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Import routes handlers
const indexRoutes = require('./routes/homeRoutes');
const addCostRoutes = require('./routes/costRoutes');
const monthlyReportRoutes = require('./routes/reportRoutes');
const userTotalRoutes = require('./routes/userRoutes');
const aboutRoutes = require('./routes/aboutRoutes');

const app = express();

// Load environment variables from .env file
dotenv.config();

/**
 * Connect to MongoDB Atlas using the URI from environment variables.
 * Logs success or exits the process on failure.
 * @returns {Promise<void>}-  A promise that resolves when the connection is successful.
 */
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('----> MongoDB Connected'))
    .catch((error) => {
      console.error('----> MongoDB Connection Error:', error.message);
      process.exit(1); // Exit with failure code
    });

// App settings
app.set('json spaces', 2); // Pretty-print JSON responses with 2 spaces

// Global request logger (prints every GET/POST)
app.use((req, res, next) => {
    console.log(`----> Received ${req.method} request to ${req.originalUrl}`);
    next();
});

// Middleware setup
app.use(logger('dev')); // HTTP request logger middleware for development
app.use(express.json()); // Parse incoming requests with JSON payloads
app.use(express.urlencoded({ extended: false })); //  Parse incoming requests with URL-encoded payloads
app.use(cookieParser());//  Parse Cookie header and populate `req.cookies`
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

// Routes setup
app.use('/', indexRoutes); // Main route
app.use('/api/add', addCostRoutes); // Route for adding cost items
app.use('/api/report', monthlyReportRoutes); // Route for generating reports
app.use('/api/users', userTotalRoutes); // Route for managing users
app.use('/api/about', aboutRoutes); // Route for displaying information about the team members

/**
 * Catch 404 and forward to error handler
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {Function} next - Callback to pass control to the next middleware
 */
app.use(function(req, res, next) {
  next(createError(404));
});

/**
 * Error handler middleware
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
app.use(function(err, req, res) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
