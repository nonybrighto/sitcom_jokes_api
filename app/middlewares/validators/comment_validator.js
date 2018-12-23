const joi = require('joi');


module.exports.addComment = {
    
    body: {
        content: joi.string().trim().min(2).max(250).required().label('comment should be more than two characters and less than 250')
    }
}