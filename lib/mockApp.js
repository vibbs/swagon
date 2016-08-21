
'use strict';

var config = require('config');
var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
var swaggerTools  = require('swagger-tools');
var bodyParser  = require('body-parser');
var fs = require('fs');
var jsYaml = require('js-yaml');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


var configuration = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(configuration, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

//first get the config file port if not there then the environment variable then if that also
//doesn't exist then default to 10010
  var port = process.env.PORT ||10010;
  app.listen(port);

  console.log('application listening to port: '+ port);

});


var swaggerDoc = jsYaml.load(fs.readFileSync('./api/swagger/swagger.yaml'));
// Initialize the Swagger middleware for the api doc purpose
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());
});

//databasesetup
var db = require('./config/db.js');
db.setup();


module.exports = app; // for testing