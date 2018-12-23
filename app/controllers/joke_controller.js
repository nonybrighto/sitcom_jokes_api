var dbUtils = require('../helpers/db_utils');
var Jokes = require('../models/jokes');
const ApiError = require('../helpers/api_error');


module.exports.addJoke = async (req, res, next) => {

    let type = req.body.type;
    let title = req.body.title;
    let movieId = req.body.movie;
    let content = (type == 'textJoke') ? req.body.text : 'none';
    let joke = new Jokes(dbUtils.getSession());

    try{

        let jokeAdded = await joke.addJoke(type, title, movieId, content, req.user.id);
        
        if(jokeAdded){
            return res.status(201).send({joke: jokeAdded});
        }else{
            return next(new ApiError('Internal error occured adding joke', true));
        }
    }catch(err){
        return next(new ApiError('Internal error occured adding joke', true));
    } 
}

