var dbUtils = require('../helpers/db_utils');
var Jokes = require('../models/jokes');
var Comments = require('../models/comments');
const ApiError = require('../helpers/api_error');
const Pagination = require('../helpers/pagination');
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
    let page = req.query.page;
    let perPage = req.query.perPage;
    let currentUserId = (req.user)? req.user.id: null;


  
        let joke = new Jokes(dbUtils.getSession());
        let jokesCount = await joke.getJokesCount(jokeType);
        let pagination = new Pagination('url', jokesCount, page, perPage);
        let gottenJokes = await joke.getJokes(jokeType, pagination.getOffset(), perPage, currentUserId);

        return res.status(httpStatus.OK).send({...pagination.generatePaginationObject(), results: gottenJokes});

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

    let userId = req.user.id;
    let jokeId = req.params.jokeId;
    let content = req.body.content;

    try{
        let comments = new Comments(dbUtils.getSession());
        let comment = await comments.addComment(jokeId, content, userId);
        res.status(httpStatus.CREATED).send(comment);

    }catch(err){
        return next(new ApiError('Internal error occured while adding comment', true));
    }

}


module.exports.getJokeComments = async (req, res, next) => {

    let page = req.query.page;
    let perPage = req.query.perPage;
    let jokeId = req.params.jokeId;

    try{
        let comments = new Comments(dbUtils.getSession());
        let commentsCount = await comments.getCommentsCount(jokeId);
        let pagination = new Pagination('url', commentsCount, page, perPage);
        let gottenComments = await comments.getComments(jokeId, pagination.getOffset(), perPage);

        return res.status(httpStatus.OK).send({...pagination.generatePaginationObject(), comments: gottenComments});

    }catch(err){
        return next(new ApiError('Internal error occured while getting comments', true));
    }
}


