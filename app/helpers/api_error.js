let httpStatus = require('http-status');


class APIError extends Error{ 

    constructor(message, isPublic = false, status = httpStatus.INTERNAL_SERVER_ERROR, errors = null){
        super(message);
        this.status = status;
        this.isPublic = isPublic;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor.name);
    }
}
module.exports =  APIError; 