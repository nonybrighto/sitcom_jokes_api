var dbUtils = require('../helpers/db_utils');
var Jokes = require('../models/jokes');
const ApiError = require('../helpers/api_error');
const Pagination = require('../helpers/pagination');


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


module.exports.getJokes = async (req, res, next) => {

    let jokeType = req.query.type;
    let page = parseInt(req.query.page);
    let perPage = parseInt(req.query.perPage || 10);


    try{
        let joke = new Jokes(dbUtils.getSession());
        let jokesCount = await joke.getJokesCount(jokeType);
        let pagination = new Pagination('url', jokesCount, page, perPage);
        let gottenJokes = await joke.getJokes(jokeType, pagination.getOffset(), perPage);

        return res.status(200).send({...pagination.generatePaginationObject(), jokes: gottenJokes});

    }catch(err){
        return next(new ApiError('Internal error occured while getting joke', true));
    }

}

