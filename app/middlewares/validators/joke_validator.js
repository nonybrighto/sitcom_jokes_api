const Joi = require('joi');

const createJokeSchema = {
    
    body: {
        title: Joi.string().trim().min(3).required().label('Title should be 3 characters or more'),
        tmdbMovieId: Joi.number().integer().required().label('Please provide a movie'),
        text: Joi.string().trim().min(20).label('text should be more than 20 characters')
    }
}

module.exports.createJoke = createJokeSchema;


module.exports.jokeBodyValidForUpload = (requestBody)=>{

    const result =  Joi.validate(requestBody, createJokeSchema.body);
    return result.error === null;
}