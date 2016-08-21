#! /usr/bin/env node

var userArgs = process.argv.slice(2);
var shell = require("shelljs");

var clc = require('cli-color');

var lib = require('./lib/stubGenerator.js');

var packData = null;

var mongoPack = require('./lib/mockPackaMongo.js');
var redisPack = require('./lib/mockPackageRedis.js');
var neoPack = require('./lib/mockPackageNeo.js');

var envData = null;

var dockerData = "FROM node\n\nENV PORT 10010\n\nENV NODE_ENV development\n\nEXPOSE 10010\n\nWORKDIR /code\n\nCOPY . ./\n\nRUN cd /code && npm i --$NODE_ENV\n\nENTRYPOINT cd /code && node app.js";
/*Mongo = require('./lib/mockPackageMongo.js');
var packDataRedis = require('./lib/mockPackageRedis.js');
var packDataNeo = require('./lib/mockPackageNeo.js');
*/

var fs = require('fs');

var co = require('co');
var prompt = require('co-prompt');
var program = require('commander');

var projectName = "";
var yamlFile = "";

 program
 .arguments('<file>')
  .option('-p, --projectname <projectname>', 'Project name to create one, along with YAML file local path')
 // .option('-db, --database <database>', 'Which database :\n\t\t\t\t\t1. Mongo\n\t\t\t\t\t2. Redis\n\t\t\t\t\t3. Neo4j \n\t\t\t\t\tdefault: Mongo')
 // .option('-g, --generate <stubs>', 'Generate\n\t\t\t\t\t1.Functions only\n\t\t\t\t\t2.Tests only\n\t\t\t\t\t3.Models only\n\t\t\t\t\t4.All\n\t\t\t\t\tdefault: functions only\n\t\t\t\t\tInput a number')
  .action(function(file) {
      co(function *() {
        var prorjectName = null;
        var dbType = null;
        var stubs = null;

        if(program.projectname == undefined){
          prorjectName = yield prompt('project name: ');
        }else{
          prorjectName = program.projectname;
        }

        // if(program.database == undefined){
        //   dbType = yield prompt('database type\n 1. Mongo\n 2. Redis\n 3. Neo4j \n default: Mongo: ');
        // }else{
        //   dbType = program.database;
        // }
        
        // if(program.stubs == undefined){
        //   stubs = yield prompt('Generate\n 1.Functions only\n 2.Tests only\n 3.Models only\n 4.All\n default: functions only\nInput a number: ');
        // }else{
        //   stubs = program.stubs;
        // }  


        if(prorjectName != null && !isNaN(dbType) && !isNaN(stubs)){
            processData(prorjectName, Number(dbType), Number(stubs), file);
        }else{
            errorOut();
        }

        
      });

     
  })
  .parse(process.argv);



function processData(name, dbType, stubs, file){


	console.log(clc.blue('ProjectName: '+name+'  file: ' +file+ " dbtype: "+dbType+" stubs "+stubs));
  
  shell.exec("swagger project create -f express "+name);
  shell.exec("cp "+ file+" ./"+name+"/api/swagger/swagger.yaml");
  shell.exec("echo > ./"+name+"/config/db.js");
  shell.rm("./"+name+"/api/controllers/hello_world.js");
  shell.rm('-rf', "./"+name+"/test/api");
  
  var rootDir = __dirname;
  packData = mongoPack; 
               shell.exec("cp "+rootDir+"/lib/mockDBMongo.js ./"+name+"/config/db.js");
               envData = "NODE_ENV=development\nMONGODB_SVC_NAME="+name+"\nDB_NAME="+name+"_db\nPORT=10010\n"+name+"_SERVICE_HOST=127.0.0.1\n"+name+"_SERVICE_PORT=27017";
               


  // if(dbType>0 && dbType<4){
  //   //good
  //   switch(dbType){
  //     case 1 : packData = mongoPack; 
  //              shell.exec("cp "+rootDir+"/lib/mockDBMongo.js ./"+name+"/config/db.js");
  //              envData = "NODE_ENV=development\nMONGODB_SVC_NAME="+name+"\nDB_NAME="+name+"_db\nPORT=10010\n"+name+"_SERVICE_HOST=127.0.0.1\n"+name+"_SERVICE_PORT=27017";
  //               break;
  //     case 2 : packData = redisPack; 
  //              shell.exec("cp "+rootDir+"/lib/mockDBRedis.js ./"+name+"/config/db.js");
  //              envData = "NODE_ENV=development\nREDISDB_SVC_NAME="+name+"\nDB_NAME="+name+"_db\nPORT=10010\n"+name+"_SERVICE_HOST=127.0.0.1\n"+name+"_SERVICE_PORT=6379";
  //               break;
  //     case 3 : packData = neoPack; 
  //              shell.exec("cp "+rootDir+"/lib/mockDBNeo.js ./"+name+"/config/db.js");
  //              envData = "NODE_ENV=development\nNEO4JDB_SVC_NAME="+name+"\nDB_NAME="+name+"_db\nPORT=10010\n"+name+"_SERVICE_HOST=127.0.0.1\n"+name+"_SERVICE_PORT=7474";
  //               break;
  //     default :  packData = mongoPack; 
  //                shell.exec("cp "+rootDir+"/lib/mockDBMongo.js ./"+name+"/config/db.js");
  //              envData = "NODE_ENV=development\nMONGODB_SVC_NAME="+name+"\nDB_NAME="+name+"_db\nPORT=10010\n"+name+"_SERVICE_HOST=127.0.0.1\n"+name+"_SERVICE_PORT=27017";
  //               break;
  //   }
  // }else{
  //   //default mongo
  //    packData = mongoPack; 
  //    shell.exec("cp "+rootDir+"/lib/mockDB.js ./"+name+"/config/db.js");
  //              envData = "MONGODB_SVC_NAME="+name+"\nDB_NAME="+name+"_db\nPORT=10010\n"+name+"_SERVICE_HOST=127.0.0.1\n"+name+"_SERVICE_PORT=27017";
  // }

//what needs to be generated
lib.genAll("./"+name+"/api/swagger/swagger.yaml", name);

  // if(stubs>0 && stubs<5){
  //   //good
  //   switch(stubs){
  //     case 1: lib.genFunctions("./"+name+"/api/swagger/swagger.yaml", name); break;
  //     case 2: lib.genTests("./"+name+"/api/swagger/swagger.yaml", name); break;
  //     case 3: lib.genModels("./"+name+"/api/swagger/swagger.yaml", name); break;
  //     case 4: 
  //             lib.genK8Template("./"+name+"/api/swagger/swagger.yaml", name, dbType); 
  //             break;
  //     default : lib.genAll("./"+name+"/api/swagger/swagger.yaml", name); 
  //               lib.genK8Template("./"+name+"/api/swagger/swagger.yaml", name, dbType);
  //               break;
  //   }
  // }else{
  //   //default function
  //   lib.genAll("./"+name+"/api/swagger/swagger.yaml", name);
  //   lib.genK8Template("./"+name+"/api/swagger/swagger.yaml", name, dbType);
  // }

//setting up the dockerignore 
if(!fs.existsSync('./'+name+'/.dockerignore')){ 
        fs.writeFileSync('./'+name+'/.dockerignore', ".git \n.gitignore \n node_modules \n README.md \n *.log \n .env");
}else{
      fs.writeFileSync('./'+name+'/.dockerignore', ".git \n.gitignore \n node_modules \n README.md \n *.log \n .env");
}

//setting up the Docker File for containerizing 
 if(!fs.existsSync('./'+name+'/Dockerfile')){ 
        fs.writeFileSync('./'+name+'/Dockerfile', dockerData);
}else{
      fs.writeFileSync('./'+name+'/Dockerfile', dockerData);
}


//modifying the package.json for our specific requirements
  packData.name = name;
  var formateddata = JSON.stringify(packData, null, 3);

  if(!fs.existsSync("./"+name+"/package.json")){ 
        fs.writeFileSync("./"+name+"/package.json", formateddata);
  }else{
      fs.writeFileSync("./"+name+"/package.json", formateddata);
  }


//setting up the environmental file
  if(!fs.existsSync('./'+name+'/.env')){ 
      fs.writeFileSync('./'+name+'/.env', envData);
  }else{
      fs.writeFileSync('./'+name+'/.env', envData);
  }

 


  var app_id = '\n\napplication_id : '+name;

  shell.cp(rootDir+'/lib/mockDefault.yaml', './'+name+'/config/default.yaml');
  shell.exec("echo " + app_id + " >> ./" + name + "/config/default.yaml");

  shell.exec("echo > ./"+name+"/config/test.yaml");
  shell.cp(rootDir+'/lib/mockTest.yaml', './'+name+'/config/test.yaml');
  shell.exec("echo > ./"+name+"/config/logger.js");
  shell.exec("cp "+rootDir+"/lib/mockLogger.js ./"+name+"/config/logger.js");
  shell.exec("cp "+rootDir+"/lib/mockApp.js ./"+name+"/app.js");



  // fs.appendFile('./'+name+'/config/default.yaml', app_id, function (err) {
  //   console.log(err);
  // });
  

  console.log(clc.yellow("\n\n\ntype 'cd "+name+"'type 'npm install' \n\n\n then type 'swagger project start' to run your application!")); 
  process.exit(0);
}

function errorOut(){
  console.log(clc.red("errored out"));
  process.exit(1);
}


//todo: deault db.js settings
  




  
