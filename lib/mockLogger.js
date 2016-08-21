/*eslint no-unused-vars: [2, {"args": "after-used", "argsIgnorePattern": "^encoding$"}]*/
'use strict';
var config = require('config');
var winston = require('winston');


winston.emitErrs = true;

var fileLogLevel = config.get('logging.file.loglevel');
var consoleLogLevel = config.get('logging.console.loglevel');

var fileName = './logFiles/' + config.get('logging.file.name') + '.log';

// debug which is only set via env overrides all other specified
// settings as it is usually a last resort approach!
if (config.has('debug') && config.get('debug')) {
    fileLogLevel = 'debug';
    consoleLogLevel = 'debug';
}


//end of date based file names
var transports = [
    new winston.transports.File({
        level: fileLogLevel,
        filename: fileName,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, //5MB
        maxFiles: 5,
        colorize: false
    })
];

if (process.env.NODE_ENV === 'development') {
transports.push(
    new winston.transports.Console({
        level: consoleLogLevel,
        handleExceptions: true,
        json: false,
        colorize: true
    })
);
}

var logger = new (winston.Logger)({
    transports: transports,
    exitOnError: false
});

var logger = new (winston.Logger)({
    transports: transports,
    exitOnError: false
});

module.exports.stream = {
    write: function(message, encoding) {
        logger.info(message);
    }
};


