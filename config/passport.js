const passportJWT = require("passport-jwt");
const Users = require('../app/models/users');
const SocialAccounts = require('../app/models/social_accounts');
const dbUtils = require('../app/helpers/db_utils');
const JwtHelper = require('../app/helpers/jwt_helper');
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleIdTokenStrategy = require('passport-google-id-token');

const ExtractJWT = passportJWT.ExtractJwt;

const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;
const nconf = require('./config');


module.exports = function(passport){

    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    function (username, password, done) {

        let user = new Users(dbUtils.getSession());
        let jwtHelper = new JwtHelper();
        user.canLogin(username, password).then(function(user){
            if(user){
                return done(null, jwtHelper.getJwtUserObject(user));
            }else{
                return done(null, false, { message: 'Invalid login or password' });
            }
        }).catch(function(err){
                return done(err);
        });
    }
));

    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('jwt') ,
        secretOrKey   : nconf.get('jwt-secret')
    },
    function (jwtPayload, cb) {

        let user = new Users(dbUtils.getSession());
        let jwtHelper = new JwtHelper();
        user.get({prop:{id:jwtPayload.id}}).then((user)=>{
            return cb(null, jwtHelper.getJwtUserObject(user));
        }).catch((err)=>{
            return cb(err);
        });
         
    }
));


passport.use(new GoogleIdTokenStrategy({
    clientID: nconf.get('google-client-id')
  },
  function(parsedToken, googleId, done) {
    return done(err, {username:'facebookuser',email:'facebookuseremail'});
  }
));


passport.use(new FacebookTokenStrategy({
    clientID: nconf.get('facebook-client-id'),
    clientSecret: nconf.get('facebook-client-secret')
  }, async function(accessToken, refreshToken, profile, done) {
      

        //get user details from the database

        //TODO: get the user's details from the profile
        user = await createSocialUser('facebook', '1234567', 'nony2@gmail.com', 'nony nonso bright');
        return done(null, {user: user});
  }
));

}

async function createSocialUser(accountType, accountId, email, name){
  let users = new Users(dbUtils.getSession());
  let socialAccounts = new SocialAccounts(dbUtils.getSession(), accountType);
  let user = await users.get({prop:{email:email}});
  if(user){
          if(await socialAccounts.accountExists(accountId)){
              await socialAccounts.updateUse(accountId, email);
          }else{
              await socialAccounts.addAccount(accountId, email);
          }
          return user;
  }else{
      let username = 'useName';
      while(await users.usernameTaken(username)){
          let randomUsernameString = Math.random().toString(36).slice(-3);
          username = username+randomUsernameString;
      }

      let  randomPasswordString  = Math.random().toString(36).slice(-8);
      user = await users.addUser(username, email, randomPasswordString);
      await socialAccounts.addAccount(accountId, email); // consider refactoring this and the one above
      return user;
  }
  return false;
}


