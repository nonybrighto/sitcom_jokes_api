const dbUtils = require('../helpers/db_utils');
const JwtHelper = require('../helpers/jwt_helper');
const GeneralHelper = require('../helpers/general_helper');
const Users = require('../models/users');
const Jokes = require('../models/jokes');
const PasswordTokens = require('../models/password_tokens');
const ApiError = require('../helpers/api_error');
const httpStatus = require('http-status');

module.exports.getAllUsers = async (req, res, next) => {


    let user = new Users(dbUtils.getSession());
    new GeneralHelper().buildMultiItemResponse(req, res, next, {
        itemCount: await user.getAllUsersCount(),
        getItems: async (offset, limit) => await  user.getAllUsers(offset, limit),
        errorMessage: 'internal error occured while getting users' 
    });
}

module.exports.addNewUser = async (req, res, next) => {

    let userz = new Users(dbUtils.getSession());
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    Promise.all([userz.isEmailTaken(email), userz.usernameTaken(username)]).then(
        async (result) => {
            if (result[0]) {
                return next(new ApiError('The Email has already been taken', true, httpStatus.CONFLICT));
            }
            if (result[1]) {
                return next(new ApiError('The Username has already been taken', true,  httpStatus.CONFLICT));
            }

            try {
                let newUser = await userz.addUser(username, email, password);
                if (newUser) {
                    let jwtHelper = new JwtHelper();
                    jwtHelper.sendJwtResponse(res, newUser, httpStatus.CREATED);
                } else {
                    return next(new ApiError('Internal error occured while registering user', true));
                }
            } catch (err) {
                next(err);
            }

        }
    ).catch((err) => {
        console.log(err);
        next(err);
    });

}

module.exports.getUser = async(req, res, next) => {

        try{
            let userId = req.params.userId;
            let currentUserId = (req.user)?req.user.id: null;
            let users = new Users(dbUtils.getSession());
            let user = await users.getUser(userId, currentUserId);
            if(user){
                return res.status(httpStatus.OK).send(user);
            }else{
                return res.status(httpStatus.NOT_FOUND).send({message: 'The user could not be found'});
            }


        }catch(error){
            return next(new ApiError('Internal error occured while getting user', true));
        }


}
module.exports.getUserFollowers = async(req, res, next) => {

        try{
            let userId = req.params.userId;
            let currentUserId = (req.user)?req.user.id: null;

            let user = new Users(dbUtils.getSession());
            new GeneralHelper().buildMultiItemResponse(req, res, next, {
                itemCount: await user.getUserFollowersCount(userId),
                getItems: async (offset, limit) => await  user.getUserFollowers(userId, currentUserId, offset, limit),
                errorMessage: 'internal error occured while getting users' 
            });

        }catch(error){
            return next(new ApiError('Internal error occured while getting user', true));
        }


}
module.exports.getUserFollowing = async(req, res, next) => {

        try{
            let userId = req.params.userId;
            let currentUserId = (req.user)?req.user.id: null;

            let user = new Users(dbUtils.getSession());
            new GeneralHelper().buildMultiItemResponse(req, res, next, {
                itemCount: await user.getUserFollowingCount(userId),
                getItems: async (offset, limit) => await  user.getUserFollowing(userId,currentUserId, offset, limit),
                errorMessage: 'internal error occured while getting users' 
            });

        }catch(error){
            return next(new ApiError('Internal error occured while getting user', true));
        }

}

module.exports.followUser = async (req, res, next) => {

    try{

        let currentUserId  = req.user.id;
        let userId = req.params.userId;

        let users = new Users(dbUtils.getSession());
        let userFollowed = await users.isUserFollowed(userId, currentUserId);
        
        if(!userFollowed){
            let followed = await users.followUser(userId, currentUserId);
            if(followed){
                return res.sendStatus(httpStatus.NO_CONTENT);
            }else{
                return res.status(httpStatus.NOT_FOUND).send({message: 'The user could not be found'});
            }
        }else{
            return next(new ApiError('User already followed', true,  httpStatus.CONFLICT));
        }
        
    }catch(error){
        return next(new ApiError('Internal error occured while following user', true));
    }  
    
}

module.exports.unfollowUser = async (req, res, next) => {
    
    try{
        let currentUserId  = req.user.id;
        let userId = req.params.userId;
        
        let users = new Users(dbUtils.getSession());
        let unfollowed = await users.unfollowUser(userId, currentUserId);
        if(unfollowed){
            return res.sendStatus(httpStatus.NO_CONTENT);
        }else{
            return res.status(httpStatus.NOT_FOUND).send({message: 'The user could not be found'});
        }

    }catch(error){
        return next(new ApiError('Internal error occured while unfollowing user', true));
    }



}

module.exports.getUserFavoriteJokes = async(req, res, next) => {

        
        try{
            let currentUserId = req.user.id;
            
            let users = new Users(dbUtils.getSession());
            new GeneralHelper().buildMultiItemResponse(req, res, next, {
                itemCount: await users.getFavoriteJokesCount(currentUserId),
                getItems: async (offset, limit) => await users.getFavoriteJokes(currentUserId, offset, limit),
                errorMessage: 'internal error occured while getting user favorite jokes' 
            })


        }catch(error){
            return next(new ApiError('Internal error occured while getting user favorite jokes', true));
        }     
    
}


module.exports.getUserJokes = async(req, res, next) => {

    try{
    let currentUserId = (req.user)? req.user.id: null;
    let userId = (req.params.userId)? req.params.userId: currentUserId;


    let users = new Users(dbUtils.getSession());
    let jokes = new Jokes(dbUtils.getSession());
   
            new GeneralHelper().buildMultiItemResponse(req, res, next, {
                itemCount: await users.getUserJokesCount(userId),
                getItems: async (offset, limit) => await  jokes.getJokes(offset, limit, currentUserId, {userId: userId}),
                errorMessage: 'internal error occured while getting user  jokes' 
            })

    }catch(error){
        return next(new ApiError('Internal error occured while getting user jokes', true));
    }

        
}

module.exports.addJokeToFavorite = async(req, res, next) => {


            try{

                let currentUserId = req.user.id;
                let jokeId = req.params.jokeId;

                let users = new Users(dbUtils.getSession());
                let favorited =  await users.addJokeToFavorite(currentUserId, jokeId);
                if(favorited){
                    return res.sendStatus(httpStatus.NO_CONTENT);
                }else{
                    return res.status(httpStatus.NOT_FOUND).send({message: 'could not find joke resource'});
                }
            }catch(error){
                return next(new ApiError('Internal error occured while adding joke to favorites', true));

            }

}
module.exports.removeJokeFromFavorite = async(req, res, next) => {

    try{

        let currentUserId = req.user.id;
        let jokeId = req.params.jokeId;

        let users = new Users(dbUtils.getSession());
        let removed = await users.removeJokeFromFavorite(currentUserId, jokeId);
        if(removed){
            return res.sendStatus(httpStatus.NO_CONTENT);
        }else{
            return res.status(httpStatus.NOT_FOUND).send({message: 'The joke is not in your favorite'});
        }

    }catch(error){
        return next(new ApiError('Internal error occured while adding joke to favorites', true));
    }
}

module.exports.changePassword = async (req, res, next) => {

    //old password and new password

    let userIdToChangePassword = req.params.userId;

    if(userIdToChangePassword != req.user.id){
        
        return next(new ApiError(`You can't change password for another account`, true, httpStatus.FORBIDDEN));
    }

    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    let users = new Users(dbUtils.getSession());
    //TODO:get username from the user gotten from passport in req;
    //make surr the username matches the auth

    if(await users.canLogin(req.user.username, oldPassword)){
        let passwordChanged = await users.changePassword(req.user.id, newPassword);
        if(passwordChanged){
            res.sendStatus(204)
        }else{

            return next(new ApiError('Error occured while changing password', true));
        }
    }else{
        return next(new ApiError('Old password is incorrect', true, httpStatus.FORBIDDEN));
    }

    //TODO: check 401 for wrong credential or 403? check well
}

module.exports.sendTokenForEmail = async (req, res, next) => {

    //email
    let email = req.body.email;

    let user = new Users(dbUtils.getSession());
    if (await user.isEmailTaken(email)) {
           let  passwordToken = new PasswordTokens(dbUtils.getSession());
           let emailToken = await passwordToken.hasTokenForEmail(email); 
           if(emailToken){
                await passwordToken.deleteToken(emailToken.tokenId);
            }
            await passwordToken.createToken(email);
            //TODO: send to email here
            
            res.sendStatus(202);
    }else{
        return next(new ApiError('Could not find user with this email', true, httpStatus.NOT_FOUND));
    }

    //return 202 accepted and send token to the email

    //401 for wrong credential

}
module.exports.changePasswordWithToken = async (req, res, next) => {

    let token = req.body.token;
        let newPassword = req.body.newPassword;
        let  passwordToken = new PasswordTokens(dbUtils.getSession());
        if(await passwordToken.isValidToken(token)){
            let users = new Users(dbUtils.getSession());
            let tokenOwner = await users.getPasswordTokenOwner(token);
            
            if(tokenOwner){
                    //change user password
                    await users.changePassword(tokenOwner.id, newPassword);
                    let jwtHelper = new JwtHelper();
                    jwtHelper.sendJwtResponse(res, tokenOwner, httpStatus.OK);
            }else{
                return next(new ApiError('Token could not be matched to any account', true, httpStatus.NOT_FOUND));
            }
        }else{
            return next(new ApiError('Invalid or expired token provided', true, httpStatus.NOT_FOUND));
        }
}