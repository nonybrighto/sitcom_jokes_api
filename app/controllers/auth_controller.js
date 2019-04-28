const JwtHelper = require('../helpers/jwt_helper');
const ApiError = require('../helpers/api_error');
const passport = require('passport');
let httpStatus = require('http-status');
const Users = require('../models/users');
const dbUtils = require('../helpers/db_utils');


module.exports.login = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {

        if (err || !user) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: info ? info.message : 'Login failed',
                user: user
            });
        }
        
        req.login(user, { session: false }, (err) => {
            if (err) {
                res.send(err);
            }
            let jwtHelper = new JwtHelper();
            jwtHelper.sendJwtResponse(res, user);
        });
    })(req, res, next);

}

module.exports.googleIdTokenAuth = (req, res, next) => {

    passport.authenticate('google-id-token', { session: false },
        (err, user, info) => {
            if (err || info) {
                //res.send(err);
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: 'google authentication failed',
                });
            }
            let jwtHelper = new JwtHelper();
            jwtHelper.sendJwtResponse(res, user);
        })(req, res, next);
}


module.exports.facebookTokenAuth = (req, res, next) => {

    passport.authenticate('facebook-token', { session: false },
        (err, user, info) => {
            if (err) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: 'facebook authentication failed',
                });
            }
            let jwtHelper = new JwtHelper();
            jwtHelper.sendJwtResponse(res, user);
        })(req, res, next);

}

module.exports.refreshUserToken =  async (req, res, next) => {
        try{
            let currentUserId = req.user.id;
            let users = new Users(dbUtils.getSession());
            let user = await users.getCurrentUser(currentUserId);
            if(user){
                //TODO: delete old token
                let jwtHelper = new JwtHelper();
                jwtHelper.sendJwtResponse(res, user, httpStatus.OK);
            }else{
                return next(new ApiError('User not found', true, httpStatus.NOT_FOUND));
            }
        }catch(error){
            return next(new ApiError('Internal error occured while refreshing', true));
        }
}