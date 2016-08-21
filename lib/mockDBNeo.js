var neo4j = require('node-neo4j');
var dotenv = require('dotenv');
var logger = require('./logger');

function loadConfig() {
    dotenv.load({ silent: true });
    var prefix = process.env.NEO4JDB_SVC_NAME;
    return {
        "db.name": process.env.DB_NAME
        , "db.host": process.env[prefix + '_SERVICE_HOST']
        , "db.port": process.env[prefix + '_SERVICE_PORT']
    };
}

function setup(){
    var config = loadConfig();
    var dbName = config.get('db.name');
    var host = config.get('db.host');
    var port = config.get('db.port');
    
    //some extra work needs to be done here will decide later
}
