const dbUtils = require('../helpers/db_utils');
const Jokes = require('../models/jokes');
const Movies = require('../models/movies');
const Comments = require('../models/comments');
const ApiError = require('../helpers/api_error');
const GeneralHelper = require('../helpers/general_helper');
const _ = require('lodash');
const httpStatus = require('http-status');
const got = require('got');
const fs = require('fs');


module.exports.addJoke = async (req, res, next) => {
    
    try{
    let userId = req.user.id;
    let title = req.body.title;
    let tmdbMovieId = +req.body.tmdbMovieId;
    let text = req.body.text;
    let image;

    let canAddMovie = false;

    let imageFile = req.file;

    let movies = new Movies(dbUtils.getSession());

    

    if(await movies.movieExists(tmdbMovieId)){
        canAddMovie = true;
    }else{

        let response = await got(`https://api.themoviedb.org/3/tv/${tmdbMovieId}?api_key=ff066eac5b5bd813f4cb906eb5cf2c21&append_to_response=credits,images`);
        let gottenMovie = JSON.parse(response.body);

        let name = gottenMovie.name;
        let posterPath = gottenMovie.poster_path;
        let firstAirDate = gottenMovie.first_air_date;
        let overview = gottenMovie.overview;
        let movie = await movies.addMovie({name: name, tmdbMovieId: tmdbMovieId, overview: overview, posterUrl: posterPath, firstAirDate: firstAirDate});
        if(movie){
            canAddMovie = true;
        }
    }
    
    if(canAddMovie){
        if(text === null &&  imageFile === null ){
            return next(new ApiError('Internal error occured while adding joke', true, httpStatus.UNPROCESSABLE_ENTITY));
        }
    
        if(imageFile){
            image = req.file.destination+req.file.filename;
        }
        
            let joke = new Jokes(dbUtils.getSession());
           
                let jokeAdded = await joke.addJoke(title, tmdbMovieId, text, image, userId);
                
                if(jokeAdded){
                    return res.status(httpStatus.CREATED).send(jokeAdded);
                }else{
                    return next(new ApiError('Internal error occured while adding joke', true));
                }
    }else{
        return next(new ApiError('Internal error occured while adding joke', true));
    }
    
    }catch(err){
        return next(new ApiError('Internal error occured while adding joke', true));
    } 

}

module.exports.getJokes = async (req, res, next) => {

    try{
    let currentUserId = (req.user)? req.user.id: null;
    let popular = (req.path === '/popular');


        let joke = new Jokes(dbUtils.getSession());
        new GeneralHelper().buildMultiItemResponse(req, res, next, {
            itemCount: await joke.getJokesCount(),
            getItems: async (offset, limit) => await  joke.getJokes(offset, limit, currentUserId, {popular: popular}),
            errorMessage: 'internal error occured while getting jokes' 
        })

    }catch(err){
        return next(new ApiError('Internal error occured while getting jokes', true));
    }

}

module.exports.getJoke = async (req, res, next) => {

        let id = req.params.jokeId;

        try{
            let joke = new Jokes(dbUtils.getSession());
            let gottenJoke = await joke.getJoke(id);

            if(gottenJoke){
                    res.status(httpStatus.OK).send(gottenJoke);
            }else{
                return next(new ApiError('Joke not found', true, httpStatus.NOT_FOUND));
            }

        }catch(err){
            return next(new ApiError('Internal error occured while getting joke', true));
        }

}

module.exports.deleteJoke = async (req, res, next) => {

    let jokeId = req.params.jokeId;
    let currentUserId = req.user.id;

                        
    
    try{
        let jokes = new Jokes(dbUtils.getSession());
        let joke = await jokes.getJoke(jokeId);
        if(joke.owner.id == currentUserId){

            
            let deleted = await jokes.deleteJoke(jokeId);
            if(deleted){
                if(joke.imageUrl != null){
                        let slashIndex = joke.imageUrl.indexOf('/',9);
                        let jokeImagePath = joke.imageUrl.slice(slashIndex);
                        let absPath = __dirname+'/../..'+jokeImagePath;
                        console.log(absPath);
                        fs.unlink(absPath, (err)=>{
                            //TODO: log the file that didn't get deleted successfully
                            return res.sendStatus(httpStatus.NO_CONTENT);
                        });
                }else{
                    return res.sendStatus(httpStatus.NO_CONTENT);
                }
                
            }else{
                return next(new ApiError(`Joke could not be found`, true, httpStatus.NOT_FOUND));
            }

        }else{
            return next(new ApiError(`Joke doesn't belong to authenticated user`, true, httpStatus.FORBIDDEN));
        }

    }catch(err){
        return next(new ApiError('Internal error occured while deleting joke', true));
    }

}


module.exports.addJokeComment = async (req, res, next) => {

   

    try{

        let currentUserId = req.user.id;
        let jokeId = req.params.jokeId;
        let content = req.body.content;
        
        let comments = new Comments(dbUtils.getSession());
        let comment = await comments.addComment(jokeId, content, currentUserId);
        if(comment){
            res.status(httpStatus.CREATED).send(comment);
        }else{
            return res.status(httpStatus.NOT_FOUND).send({message: 'The joke could not be found'});
        }

    }catch(err){
        return next(new ApiError('Internal error occured while adding comment', true));
    }

}


module.exports.getJokeComments = async (req, res, next) => {

    
    try{
        let jokeId = req.params.jokeId;

        let comments = new Comments(dbUtils.getSession());
        new GeneralHelper().buildMultiItemResponse(req, res, next, {
            itemCount: await comments.getCommentsCount(jokeId),
            getItems: async (offset, limit) => await  comments.getComments(jokeId, offset, limit),
            errorMessage: 'internal error occured while getting comment' 
        })
    }catch(err){
        return next(new ApiError('Internal error occured while getting comments', true));
    }
}

module.exports.getJokeLikers = async (req, res, next) => {

    
    
    try{
        let jokeId = req.params.jokeId;
        let joke = new Jokes(dbUtils.getSession());
        new GeneralHelper().buildMultiItemResponse(req, res, next, {
            itemCount: await joke.getJokeLikesCount(jokeId),
            getItems: async (offset, limit) => await  joke.getJokeLikers(jokeId, offset, limit),
            errorMessage: 'internal error occured while getting joke likes' 
        })
    }catch(err){
        return next(new ApiError('Internal error occured while getting joke likes', true));
    }
    

}


module.exports.likeJoke = async(req, res, next) => {

    try{
        let currentUserId = (req.user) ? req.user.id : null;
        let jokeId = req.params.jokeId;


        let jokes = new Jokes(dbUtils.getSession());
        let liked = await jokes.likeJoke(jokeId, currentUserId);
        if(liked){
            return res.sendStatus(httpStatus.NO_CONTENT);
        }else{
            return res.status(httpStatus.NOT_FOUND).send({message: 'The joke could not be found'});
        }

    }catch(error){
        return next(new ApiError('Internal error occured while liking joke', true));
    }


}

module.exports.unlikeJoke = async(req, res, next) => {

try{
    let currentUserId = req.user.id;
    let jokeId = req.params.jokeId;


    let jokes = new Jokes(dbUtils.getSession());
    let unliked = await jokes.unlikeJoke(jokeId, currentUserId);
    if(unliked){
        return res.sendStatus(httpStatus.NO_CONTENT);
    }else{
        return res.status(httpStatus.NOT_FOUND).send({message: 'The joke could not be found'});
    }
    
}catch(error){
    return next(new ApiError('Internal error occured while unliking joke', true));
}


}