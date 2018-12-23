const joi = require('joi');


module.exports.createJoke = {
    
    body: {
        type: joi.string().trim().required().label('Joke type should be imageJoke or textJoke'),
        title: joi.string().trim().min(3).required().label('Title should be 3 characters or more'),
        movie: joi.string().trim().required().label('Please provide a movie'),
        text: joi.string().trim().min(30).label('text should be more than 30 characters')
    }
}