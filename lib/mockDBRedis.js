
var log = require('./logger');
var redis = require("redis");

var dotenv = require('dotenv');

module.exports = {
    setup: setup,
    getClient : getClient
}

var client = null;
function setup(){

    function loadConfig() {
        dotenv.load({ silent: true });
        var prefix = process.env.REDISDB_SVC_NAME;
        return {
            host: process.env[prefix + '_SERVICE_HOST']
            , port: process.env[prefix + '_SERVICE_PORT']
        };
    }
    var config = loadConfig();
    log.debug('Connecting to redis://%s:%s', config.host, config.port);
     client = redis.createClient(config)
        .on("error", function (err) {
            log.error(err);
        })
        .on('ready', function(err) {
            log.debug('Connection to redis://%s:%s successful', config.host, config.port);
        });

 
}

function getClient(){
    return client;
}