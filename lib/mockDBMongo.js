'use strict';

var dotenv = require('dotenv');
var mongoose = require('mongoose');
var logger = require('./logger');

var connection = mongoose.connection;

var db = module.exports = {
    connecting: false,
    connected: false
};

function loadConfig() {
    dotenv.config({ silent: false });
    var prefix = process.env.MONGODB_SVC_NAME;

    return {
        "db.name": process.env.DB_NAME
        , "db.host": process.env[prefix + '_SERVICE_HOST']
        , "db.port": process.env[prefix + '_SERVICE_PORT']
        , has: function(key) {
            return this.hasOwnProperty(key) && typeof this[key] !== 'function';
        }
        , get: function(key) {
            if ( typeof this[key] !== 'function' ) {
                return this[key];
            }
            return null;
        }
    };
}

db.setup = function() {
    var options, uri;
    var config = loadConfig();
    var dbName = config.get('db.name');
    var host = config.get('db.host');
    var port = config.get('db.port');
    var login = '';

    logger.debug('db connecting: ' + this.connecting);
    if (this.connecting || this.connected) {
        return;
    }

    if (config.has('db.login') && config.has('db.password')) {
        login = config.get('db.login') + ':' + config.get('db.password') + '@';
    }
    if (config.has('db.uri')) {
        uri = config.get('db.uri');
    } else {
        uri = 'mongodb://' + login + host + ':' + port + '/' + dbName;
    }

    options = {
        db: {
            safe: true
        }
    };

    connection.once('connected', function() {
        logger.log('info', 'db connection established: (%s:%d/%s)', host, port, dbName);
        db.connected = true;
    });

    connection.on('disconnecting', function() {
        logger.log('info', 'db connection disconnecting: (%s:%d/%s)', host, port, dbName);
    });

    connection.on('error', function(err) {
        logger.log('error', 'db (%s)', dbName, err);
    });

    // Connect to Database
    this.connecting = true;
    mongoose.connect(uri, options);

};

process.on('SIGINT', function() {
    if (db.connected) {
        mongoose.connection.close(function() {
            logger.info('default connection disconnected through app termination');
        });
    }
    process.exit();
});