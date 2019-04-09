var dbUtils = require('../helpers/db_utils');
var Movies = require('../models/movies');
var Jokes = require('../models/jokes');
const ApiError = require('../helpers/api_error');
const Pagination = require('../helpers/pagination');
let httpStatus = require('http-status');


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
        let page = req.query.page;
        let perPage = req.query.perPage;
        let currentUserId = (req.user)? req.user.id: null;
        let movieId = req.params.movieId;


        let movie = new Movies(dbUtils.getSession());
        let jokes = new Jokes(dbUtils.getSession());
        let jokesCount = await movie.getmovieJokesCount(movieId);
        let pagination = new Pagination('url', jokesCount, page, perPage);
        let gottenJokes = await jokes.getJokes(jokeType, pagination.getOffset(), perPage, currentUserId, {movieId: movieId});

        return res.status(httpStatus.OK).send({...pagination.generatePaginationObject(), results: gottenJokes});
    }catch(error){
        return next(new ApiError('Internal error occured while getting movie jokes', true));
    }

}


