var dbUtils = require('../helpers/db_utils');
var JwtHelper = require('../helpers/jwt_helper');
var Users = require('../models/users');
var PasswordTokens = require('../models/password_tokens');
const ApiError = require('../helpers/api_error');

module.exports.getAllUsers = async (req, res, next) => {
    try {
        let user = new Users(dbUtils.getSession());
        let users = await user.getAllUsers();
        //res.send(JSON.stringify(users));
        res.json(users);
    } catch (err) {
        next(err);
    }
}

module.exports.addNewUser = async (req, res, next) => {

    let userz = new Users(dbUtils.getSession());
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    Promise.all([userz.isEmailTaken(email), userz.usernameTaken(username)]).then(
        async (result) => {
            if (result[0]) {
                return next(new ApiError('The Email has already been taken', true, 409));
            }
            if (result[1]) {
                return next(new ApiError('The Username has already been taken', true, 409));
            }

            try {
                let newUser = await userz.addUser(username, email, password);
                if (newUser) {
                    let jwtHelper = new JwtHelper();
                    //user = jwtHelper.getJwtUserObject(newUser);
                   // token = jwtHelper.generateJwtToken(newUser);
                    //return res.status(201).json({ token: token, user: user });
                    jwtHelper.sendJwtResponse(res, newUser, 201);
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

module.exports.changePassword = async (req, res, next) => {

    //old password and new password

    let userIdToChangePassword = req.params.userId;

    if(userIdToChangePassword != req.user.id){
        
        return next(new ApiError(`You can't change password for another account`, true, 403));
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
        return next(new ApiError('Old password is incorrect', true, 403));
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
        return next(new ApiError('Could not find user with this email', true, 404));
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
                    jwtHelper.sendJwtResponse(res, tokenOwner, 200);
            }else{
                return next(new ApiError('Token could not be matched to any account', true, 404));
            }

        }else{
            return next(new ApiError('Invalid or expired token provided', true, 404));
        }
}