module.exports =  {
  "name": "",
  "version": "0.0.1",
  "private": true,
  "description": "Swagger API Project",
  "keywords": [],
  "author": "",
  "license": "",
  "main": "app.js",
  "dependencies": {
    "body-parser": "^1.15.0",
    "config": "^1.17.0",
    "dotenv": "^2.0.0",
    "express": "^4.13.4",
    "js-yaml": "^3.2.6",
    "lodash": "^4.0.0",
    "kafka-node": "^0.4.0",
    "mongoose": "^4.5.5",
    "nodemon": "^1.9.1",
    "swagger-express-mw": "^0.1.0",
    "swagger-tools": "^0.9.15",
    "swaggerize-routes": "^1.0.6",
    "winston": "^2.1.0"
  },
  "devDependencies": {
    "chai": "^3.5.0",
    "chai-http": "^2.0.1",
    "grunt-contrib-jshint": "^1.0.0",
    "grunt-contrib-watch": "^0.6.1",
    "grunt-mocha-test": "^0.12.7",
    "grunt-run": "^0.5.2",
    "grunt-simple-mocha": "^0.4.1",
    "should": "^7.1.0",
    "supertest": "^1.2.0"
  },
  "scripts": {
    "start": "node app.js",
    "test": "swagger project test"
  }
}