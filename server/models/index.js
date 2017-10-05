const config = require('./db.config');
const mongoose = require('mongoose');
const logger = require('../middlewares/logger');

// Create the database connection
mongoose.connect(config.database);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
    logger.logInfo('Mongoose default connection open to ' + config.database);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
    logger.logError('Mongoose default connection error: ', err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    logger.info('Mongoose default connection disconnected');
});
