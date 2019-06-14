const winston = require('winston');

module.exports = function() {
    winston.exceptions.handle(new winston.transports.File({ filename: './logs/uncoughtExeptions.log' }));
    process.on('unhandledRejection', err => { throw err; });
}