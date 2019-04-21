const dbUtils = require('../helpers/db_utils');
const Jokes = require('../models/jokes');
const Comments = require('../models/comments');
const ApiError = require('../helpers/api_error');
const GeneralHelper = require('../helpers/general_helper');
const httpStatus = require('http-status');


module.exports.addJoke = async (req, res, next) => {
    
    let userId = req.user.id;
    let title = req.body.title;
    let movieId = req.body.movie;
    let text = req.body.text;
    let image;

    if(req.file){
        image = req.file.destination+req.file.filename;
    }
    
        let joke = new Jokes(dbUtils.getSession());
        try{
            let jokeAdded = await joke.addJoke(title, movieId, text, image, userId);
            
            if(jokeAdded){
                return res.status(httpStatus.CREATED).send(jokeAdded);
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
    let movieId = req.query.movie;


        let joke = new Jokes(dbUtils.getSession());
        new GeneralHelper().buildMultiItemResponse(req, res, next, {
            itemCount: await joke.getJokesCount(),
            getItems: async (offset, limit) => await  joke.getJokes(offset, limit, currentUserId, movieId),
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


module.exports.addJokeComment = async (req, res, next) => {

   

    try{

        let userId = req.user.id;
        let jokeId = req.params.jokeId;
        let content = req.body.content;
        
        let comments = new Comments(dbUtils.getSession());
        let comment = await comments.addComment(jokeId, content, userId);
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