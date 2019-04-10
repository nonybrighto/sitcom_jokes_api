const dbUtils = require('../helpers/db_utils');
const Movies = require('../models/movies');
const Jokes = require('../models/jokes');
const ApiError = require('../helpers/api_error');
const GeneralHelper = require('../helpers/general_helper');
const httpStatus = require('http-status');


module.exports.getMovie = async (req, res, next) => {

    let id = req.params.movieId;

    try{
        let movie = new Movies(dbUtils.getSession());
        let gottenMovie = await movie.getMovie(id);

        if(gottenMovie){
                res.status(httpStatus.OK).send(gottenMovie);
        }else{
            return next(new ApiError('Movie not found', true, httpStatus.NOT_FOUND));
        }
    }catch(err){
        return next(new ApiError('Internal error occured while getting movie', true));
    }


}


module.exports.getMovieJokes = async (req, res, next) => {
   
    try{
        let jokeType = req.query.type;
        let currentUserId = (req.user)? req.user.id: null;
        let movieId = req.params.movieId;

        let movie = new Movies(dbUtils.getSession());
        let jokes = new Jokes(dbUtils.getSession());
        new GeneralHelper().buildMultiItemResponse(req, res, next, {
            itemCount: await  movie.getmovieJokesCount(movieId),
            getItems: async (offset, limit) => await jokes.getJokes(jokeType, offset, limit, currentUserId, {movieId: movieId}),
            errorMessage: 'internal error occured while getting movie jokes' 
        })
    }catch(error){
        return next(new ApiError('Internal error occured while getting movie jokes', true));
    }

}


