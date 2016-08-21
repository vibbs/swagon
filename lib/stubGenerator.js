/**
Created By Vaibhav Doddihal 
Last updated : 02/15/2016

This script is used to generate the stubs with swagger npm package. 
npmlink: https://www.npmjs.com/package/swagger
github link: https://github.com/swagger-api/swagger-node

Which handles the routing of the files but doesn't create any function or model stubs.
This script gives three functionality:

genAll : creates function and model files with empty function stubs
genFunctionStubs : creates function files with empty function stubs
genModels : creates  model files only not linked with any other files
**/

'use strict';

var _ = require('lodash'),
util = require('util'),
path = require('path'),
fs = require('fs'),
jsYaml = require('js-yaml');

var YAML = require('yamljs');


module.exports = {
  genAll : genAll,
  genFunctions: genFunctionStubs,
  genModels : generateModels,
  genTests : generateTestCases,
  genK8Template : genK8Template,
  jsonParse : loadApi
};


//Function to handle all the file reading or content reading from yaml doc : loadApi
function loadApi(apiPath, name, content) {

var fs = require('fs');

if(!fs.existsSync('./'+name+'/logFiles')){
  fs.mkdirSync('./'+name+'/logFiles');
}



if(!fs.existsSync('./'+name+'/models')){
  fs.mkdirSync('./'+name+'/models');
}


  if (apiPath.indexOf('.yaml') === apiPath.length - 5 || apiPath.indexOf('.yml') === apiPath.length - 4) {
    return jsYaml.load(content || fs.readFileSync(apiPath));
  }
  return content ? JSON.parse(content) : yeoman.file.readJSON(apiPath);
}


//create both by calling both function
function genAll(apiPath, name){
  genFunctionStubs(apiPath, name);
  generateModels(apiPath, name);
  generateTestCases(apiPath, name);
}


//Main generate function which will generate  controller, models(mongoose schema) & test cases(for http calls)
function genFunctionStubs(apiPath, name) { 

//read yaml doc
  var api = loadApi(apiPath, name);

  function getMethodsAndControllers(obj, arr){
    var arr = arr || [];
    var metObject = {
      control : null,
      name : null
    };
    for(var key in obj){
      if(key==="x-swagger-router-controller"){

        if(key==="x-swagger-router-controller") metObject.control = obj[key];
      }
      if(key == 'get' ||key == 'put'||key == 'post'||key == 'delete') {
        metObject.name = obj[key]['operationId'];
        if(arr[obj[key]['operationId']] == null)  
          arr[obj[key]['operationId']] = metObject;
      }    

      if(typeof obj[key] === "object"){
        getMethodsAndControllers(obj[key], arr);
      }
    }
    return arr;            
  }




  /***Controller Codegen START************************************************************************/

  var conObjects = getMethodsAndControllers(api);
  var uc = new Set();
  var allData = [];
  var  uniqueArray = [];

        //to extract controllers and function names
        for (var i in conObjects) {
          uc.add(conObjects[i].control);
          var obj = {
            control : conObjects[i].control,
            name : i
          }
          uniqueArray.push(obj);
        }

        for(let item of uc){
          var fileData = {
            fileNameDir: null,
            fileDAONameDir: null,
            methods : [],
            writeDAOData : "'use strict';\n\nvar util = require('util');\n"+
            "//var Model = require('../../models/<model-name-here>');\n"+
            "module.exports = {\n   ",
            writedata : "'use strict';\n\nvar util = require('util');\n"+
            "var dao = require('../helpers/"+item+"DAO.js');\n"+
            "var logger = require('../../config/logger');\n\n\n"+
            "module.exports = {\n   "
          };
          fileData.fileNameDir = './'+name+'/api/controllers/'+ item + '.js';
          fileData.fileDAONameDir = './'+name+'/api/helpers/'+ item + 'DAO.js';
          
          for(var i in uniqueArray){
            var methodObject = {
              name : uniqueArray[i].name,
              httpmethod : uniqueArray[i].httpmethod,
              summary : uniqueArray[i].summary
            };
            if(item === uniqueArray[i].control){
              fileData.methods.push(methodObject);
            }
          }
          allData.push(fileData);
        }

        for(var i =0 ; i < allData.length; i++){
          var mets = allData[i].methods;
          
          for(var j=0; j< mets.length; j++){
            if(j!=mets.length-1){ 
              allData[i].writedata += mets[j].name +": "+ mets[j].name +",\n   ";
              allData[i].writeDAOData += mets[j].name +"DAO : "+ mets[j].name +"DAO,\n   ";
            }else{
              allData[i].writedata += mets[j].name +": "+ mets[j].name +"\n";
              allData[i].writeDAOData += mets[j].name +"DAO : "+ mets[j].name +"DAO\n   ";
            }
          }

          allData[i].writedata += "};\n\n\n\n";

          allData[i].writeDAOData += "};\n\n\n\n";

          allData[i].writedata += "// variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}\n\n var args = {};\n";

          for(var j=0; j< mets.length; j++){
            allData[i].writedata += "function " + mets[j].name +
            "(req, res) {\n\tdao."+mets[j].name+"DAO(args, function(response){\n\t\tres.json(response)\n\t});\n}\n\n\n\n";
            allData[i].writeDAOData += "function "+ mets[j].name +"DAO(args, cb){\n"+
            "\n\t//Model Based mongoose functions\n"+
            "\tif(typeof cb == 'function'){\n\t\tcb('This is from the DAO :"+ mets[j].name +"DAO');\n\t}\n\n"+
            "}\n\n";
          }

          //writing to file
          if(!fs.existsSync(allData[i].fileNameDir)){ 
            fs.writeFileSync(allData[i].fileNameDir, allData[i].writedata);
          }

          //writing DAO to file
          if(!fs.existsSync(allData[i].fileDAONameDir)){ 
            fs.writeFileSync(allData[i].fileDAONameDir, allData[i].writeDAOData);
          }
        }

        /***Controller Codegen END************************************************************************/
  } 


//seperating the model fucntion for extra flexibility
function generateModels(apiPath, name){

    //function to get data for a given key value in the embdded object
    function getresult(obj, item, result){
      var result = result || [];
      for(var key in obj){
        if(key===item){
                //console.log(obj[key]);
                result.push(obj[key]);

        }
        if(typeof obj[key] === "object"){
                getresult(obj[key], item, result);
        }
      }
          return result;
    }

//get yaml data in readable format
    var api = loadApi(apiPath, name);


    //models::********************************************************************************

    //***************************************************************************************


    var modelDefinitions = api.definitions;

    function capitalizeFirstLetter(string) {
     // console.log(string);
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getModelObject(obj){
      var result = [];
      for(var key in obj){

        if(typeof obj[key] === "object"){
          if(key === "leaf") { 

                var details = getresult(obj[key], 'properties')
                result.push({key : details});
          }
        }
      }
          return result
    }

        var eachModelDef = getModelObject(modelDefinitions);

        for(let eachobj in modelDefinitions){


        var modelData = "'use strict';\nvar mongoose = require('mongoose');\n\n"

        modelData += "var "+ eachobj +" = function() {\n\n";
        modelData += "\t\tvar "+ eachobj +"Schema = mongoose.Schema({\n";
            var j =0;
        for(let eachprop in modelDefinitions[eachobj].properties){
          if(modelDefinitions[eachobj].properties[eachprop].type != undefined){


          var type = capitalizeFirstLetter(modelDefinitions[eachobj].properties[eachprop].type);

          if(j != (_.size(modelDefinitions[eachobj].properties)-1)) { 
           if(type==='Integer') {modelData += "\t\t\t"+ eachprop + " : " +  "Number" + ',\n';}
           else{ modelData += "\t\t\t"+ eachprop + " : " +  type + ',\n';}
         }else{
           if(type==='Integer') {modelData += "\t\t\t"+ eachprop + " : " +  "Number" + '\n';}
           else{ modelData += "\t\t\t"+ eachprop + " : " +  type + '\n';}
         }
         j++;
         
         }
       }

    modelData += "\t\t});\n\t\treturn mongoose.model('"+ eachobj +"', "+ eachobj +"Schema);\n};\n\nmodule.exports = "+ eachobj +"();";

    var modeldir = './'+name+'/models/'+eachobj+'.js';
    if(!fs.existsSync(modeldir)){ 
        fs.writeFileSync(modeldir, modelData);
    }
  }
    //end of models**************************************************************************
}





function generateTestCases(apiPath , name){
  var api = loadApi(apiPath , name);

  var fileData = "process.env.NODE_ENV = 'test';\n"+
                  "var chai = require('chai');\n"+
                  "var chaiHttp = require('chai-http');\n"+
                  "var server = require('../app');\n"+
                  "var should = chai.should();\n"+
                  "chai.use(chaiHttp);\n\n"+
                  "var testData = {'place your object to test here'}\n\n\n"+
                  "describe('"+name+"-Endpoint Testing', function() {\n\tconsole.log(new Date());\n";




var pathsArr = Object.keys(api.paths);
var operations = [];

for(var i =0 ; i < pathsArr.length ; i ++){
  operations[pathsArr[i]] = Object.keys(api.paths[pathsArr[i]]);
}



  for(var key in operations){
    var ops = operations[key];
    for(var i =1 ; i < ops.length ; i++){
    var writeTestData = "\n\t it('Testing for "+ops[i].toUpperCase()+" Method of "+name+"-Valid Data Set', function(done) {\n"+
                      " \n\t\tchai.request(server)"+
                      "\n\t\t\t."+ops[i].toLowerCase()+"('"+api.basePath+key+"/')";

         if(ops[i].toLowerCase() == 'post' || ops[i].toLowerCase() == 'put'){
          writeTestData += "\n\t\t\t.set('Content-Type', 'application/json; charset=utf-8')";
          writeTestData += "\n\t\t\t.send(testData)"; 
         }             

         writeTestData += "\n\t\t\t.end(function(err, res){"+
                          "\n\t\t\t\tres.should.have.status(200);"+
                          "\n\t\t\t\tres.body.should.be.a('object');"+
                          "\n\t\t\t\tdone();"+
                          "\n\t\t\t});"+
                          "\n\t});\n\n";

    var writeTestDataFail = "\n\t it('Testing for "+ops[i].toUpperCase()+" Method of "+name+"-InValid Data Set', function(done) {\n"+
                      " \n\t\tchai.request(server)"+
                      "\n\t\t\t."+ops[i].toLowerCase()+"('"+api.basePath+key+"/')";

         if(ops[i].toLowerCase() == 'post' || ops[i].toLowerCase() == 'put'){
          writeTestDataFail += "\n\t\t\t.set('Content-Type', 'application/json; charset=utf-8')";
          writeTestDataFail += "\n\t\t\t.send(testData)"; 
         }             

         writeTestDataFail += "\n\t\t\t.end(function(err, res){"+
                          "\n\t\t\t\tres.should.have.status(400);"+
                          "\n\t\t\t\tres.body.should.be.a('object');"+
                          "\n\t\t\t\tdone();"+
                          "\n\t\t\t});"+
                          "\n\t});\n\n";                      
    
        fileData += writeTestData + writeTestDataFail ;
      }
     
    
  }


fileData += "\n\n\n});";

var testDir = './'+name+'/test/test-server.js';
    if(!fs.existsSync(testDir)){ 
        fs.writeFileSync(testDir, fileData);
    }


}




function genK8Template(apiPath , name, db_type){

  if(!fs.existsSync('./'+name+'k8s-template')){
  fs.mkdirSync('./'+name+'k8s-template');
  }

  if(!fs.existsSync('./'+name+'k8s-template/rc')){
  fs.mkdirSync('./'+name+'k8s-template/rc');
}

if(!fs.existsSync('./'+name+'k8s-template/svc')){
  fs.mkdirSync('./'+name+'k8s-template/svc');
}
  




  var api = loadApi(apiPath , name);

  var mongoENV = [{
        name: 'MONGODB_SVC_NAME',
        value: name
      },
      {
        name: 'DB_NAME',
        value: name+'_db'
      }
  ];

  var redisENV = [{
        name: 'REDIS_SVC_NAME',
        value: name
      }
  ];

  var neoENV = [{
      name: 'NEO_SVC_NAME',
      value: name
      }
  ];


  var rootDir = __dirname;
  

  var nativeObject = YAML.load( rootDir+'/K8apiRC.yaml');

  nativeObject.metadata.name = name;
  nativeObject.metadata.labels.name = name;
  nativeObject.spec.selector.name = name;
  nativeObject.spec.template.metadata.labels.name = name;
  nativeObject.spec.template.spec.containers[0].name = name;

  nativeObject.spec.template.spec.containers[0].image = name;

  //environmental variables are added to this env array object
  if(db_type == 1){
    nativeObject.spec.template.spec.containers[0].env = mongoENV;
  
  }else if(db_type == 2){
    nativeObject.spec.template.spec.containers[0].env = redisENV;
    
  }else if(db_type == 3 ){
    nativeObject.spec.template.spec.containers[0].env = neoENV;
   
  }else{
    nativeObject.spec.template.spec.containers[0].env = mongoENV;
   
  }

  
  //port on which the application should run, default: 8080
  nativeObject.spec.template.spec.containers[0].ports[0].containerPort = 8080;
  nativeObject.spec.template.metadata.labels.version = api.basePath.replace('/', '')
  
  var yamlString = YAML.stringify(nativeObject,8,2);

  var k8dirRC = "./"+name+"k8s-template/rc/api.yaml";
  if(!fs.existsSync(k8dirRC)){ 
        fs.writeFileSync(k8dirRC, yamlString);
    }


  var nativeObjectSVC = YAML.load( rootDir+'/K8apiSVC.yaml');
  nativeObjectSVC.metadata.name = name;
  nativeObjectSVC.metadata.labels.name = name;
  nativeObjectSVC.spec.selector.name = name;

  var yamlStringSVC = YAML.stringify(nativeObjectSVC,8,2);

  var k8dirSVC = "./"+name+"k8s-template/svc/api.yaml";
  if(!fs.existsSync(k8dirSVC)){ 
        fs.writeFileSync(k8dirSVC, yamlStringSVC);
    }


}

