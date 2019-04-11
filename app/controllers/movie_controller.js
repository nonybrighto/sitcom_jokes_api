const dbUtils = require('../helpers/db_utils');
const Movies = require('../models/movies');
const Jokes = require('../models/jokes');
const ApiError = require('../helpers/api_error');
const GeneralHelper = require('../helpers/general_helper');
const httpStatus = require('http-status');


module.exports.getMovies = async (req, res, next) => {

    try{

        let currentUserId = (req.user)?req.user.id: null;

        let movies = new Movies(dbUtils.getSession());
        new GeneralHelper().buildMultiItemResponse(req, res, next, {
            itemCount: await movies.getmovieCount(),
            getItems: async (offset, limit) => await  movies.getMovies(currentUserId, offset, limit),
            errorMessage: 'internal error occured while getting movies' 
        });
    }catch(err){
        return next(new ApiError('Internal error occured while getting movies', true));
    }
}

module.exports.getMovie = async (req, res, next) => {

   
    try{
        let movieId = req.params.movieId;
        let currentUserId = (req.user)?req.user.id: null;
    
        let movies = new Movies(dbUtils.getSession());
        let gottenMovie = await movies.getMovie(movieId, currentUserId);

        if(gottenMovie){
                res.status(httpStatus.OK).send(gottenMovie);
        }else{
            return next(new ApiError('Movie not found', true, httpStatus.NOT_FOUND));
        }
    }catch(err){
        return next(new ApiError('Internal error occured while getting movie', true));
    }


}


module.exports.followMovie = async (req, res, next) => {

    try{

        let currentUserId  = req.user.id;
        let movieId = req.params.movieId;

        let movies = new Movies(dbUtils.getSession());
        let movieFollowed = await movies.isMovieFollowed(movieId, currentUserId);
        
        if(!movieFollowed){
            let followed = await movies.followMovie(movieId, currentUserId);
            if(followed){
                return res.sendStatus(httpStatus.NO_CONTENT);
            }else{
                return res.status(httpStatus.NOT_FOUND).send({message: 'The movie could not be found'});
            }
        }else{
            return next(new ApiError('Movie already followed', true,  httpStatus.CONFLICT));
        }
        
    }catch(error){
        return next(new ApiError('Internal error occured while following movie', true));
    }  
    
}

module.exports.unfollowMovie = async (req, res, next) => {
    
    try{
        let currentUserId  = req.user.id;
        let movieId = req.params.movieId;
        
        let movies = new Movies(dbUtils.getSession());
        let unfollowed = await movies.unfollowMovie(movieId, currentUserId);
        if(unfollowed){
            return res.sendStatus(httpStatus.NO_CONTENT);
        }else{
            return res.status(httpStatus.NOT_FOUND).send({message: 'The movie could not be found'});
        }

    }catch(error){
        return next(new ApiError('Internal error occured while unfollowing movie', true));
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


