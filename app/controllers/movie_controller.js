var dbUtils = require('../helpers/db_utils');
var Movies = require('../models/movies');
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