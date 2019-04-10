const dbUtils = require('../helpers/db_utils');
const Jokes = require('../models/jokes');
const Comments = require('../models/comments');
const ApiError = require('../helpers/api_error');
const GeneralHelper = require('../helpers/general_helper');
const httpStatus = require('http-status');
const Enums = require('../models/enums');


module.exports.addJoke = async (req, res, next) => {
    
    let userId = req.user.id;
    let type = req.body.type;
    let title = req.body.title;
    let movieId = req.body.movie;
    //let content = (type ==  Enums.jokeTypesEnum.textJoke) ? req.body.text : '';
    let content = req.body.content;

    let saveJoke = false;

    if(type == Enums.jokeTypesEnum.imageJoke){
        if(req.file){
            content = req.file.destination+req.file.filename;
            saveJoke = true;
        }else{
            return next(new ApiError('no image specified', true, httpStatus.UNPROCESSABLE_ENTITY));
        }
    }else{
        saveJoke = true;
    } 

    if(saveJoke){
        let joke = new Jokes(dbUtils.getSession());
        try{
            let jokeAdded = await joke.addJoke(type, title, movieId, content, userId);
            
            if(jokeAdded){
                return res.status(httpStatus.CREATED).send(jokeAdded);
            }else{
                return next(new ApiError('Internal error occured adding joke', true));
            }
        }catch(err){
            return next(new ApiError('Internal error occured adding joke', true));
        } 
    }
    return next(new ApiError('Internal error occured adding joke', true));
    
    
}

module.exports.getJokes = async (req, res, next) => {

    try{
    let jokeType = req.query.type;
    let currentUserId = (req.user)? req.user.id: null;
    let movieId = req.query.movie;


        let joke = new Jokes(dbUtils.getSession());
        new GeneralHelper().buildMultiItemResponse(req, res, next, {
            itemCount: await joke.getJokesCount(jokeType),
            getItems: async (offset, limit) => await  joke.getJokes(jokeType, offset, limit, currentUserId, movieId),
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