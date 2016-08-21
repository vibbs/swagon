/**
 * Created by vdoddiha on 6/5/2016.
 */


//TODO: Check for solution: loggin the entire object gives issues of logging the entire cursor for array object for one it works fine.


var util  = require('util'),
    logger = require('../../config/logger.js');


module.exports = {
  formatResponse: getFormatedResponse  
};


var errorObj = {
    message: null,
    status: 'error',
    timestamp: new Date()
};

var successObj = {
    data: null,
    status: 'success',
    timestamp: new Date()
};

var notFoundObj = {
    message: "Data not found for the queried parameters!",
    status: 'fail',
    timestamp: new Date()
};


function getFormatedResponse(functionCalling, err, responseObj, cb) {

    logger.info('**********************'+functionCalling+' - START**********************');

    if(err){
        errorObj.message = err;
        logger.error(errorObj);
        logger.info('**********************'+functionCalling+' - END**********************');
        if(typeof cb == 'function'){
            cb(errorObj);
        }
    }else{
        if(responseObj != null ){
            successObj.data = responseObj;
            logger.info(successObj);
            logger.info('**********************'+functionCalling+' - END**********************');
            if(typeof cb == 'function'){
                cb(successObj);
            }
        }else{
            //object not found
            logger.warn(notFoundObj);
            logger.info('**********************'+functionCalling+' - END**********************');
            if(typeof cb == 'function'){
                cb(notFoundObj);
            }
        }
    }
    
}