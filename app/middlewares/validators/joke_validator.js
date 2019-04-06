const Joi = require('joi');
const Enum = require('./../../models/enums');

const createJokeSchema = {
    
    body: {
        type: Joi.string().trim().required().label(`Joke type should be ${Enum.jokeTypesEnum.imageJoke} or ${Enum.jokeTypesEnum.textJoke}`), 
        title: Joi.string().trim().min(3).required().label('Title should be 3 characters or more'),
        movie: Joi.string().trim().required().label('Please provide a movie'),
        content: Joi.string().when('type', {is: Enum.jokeTypesEnum.textJoke, then: Joi.string().trim().min(30).label('text should be more than 30 characters')})
    }
    // body: {
    //     type: Joi.string().trim().required().label(`Joke type should be ${Enum.jokeTypesEnum.imageJoke} or ${Enum.jokeTypesEnum.textJoke}`), 
    //     title: Joi.string().trim().min(3).required().label('Title should be 3 characters or more'),
    //     movie: Joi.string().trim().required().label('Please provide a movie'),
    //     text: Joi.string().trim().min(30).label('text should be more than 30 characters')
    // }
}

module.exports.createJoke = createJokeSchema;


module.exports.jokeBodyValidForUpload = (requestBody)=>{

    const result =  Joi.validate(requestBody, createJokeSchema.body);
    return result.error === null && requestBody.type == Enum.jokeTypesEnum.imageJoke;
}