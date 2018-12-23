const passportJWT = require("passport-jwt");
const Users = require('../app/models/users');
const SocialAccounts = require('../app/models/social_accounts');
const dbUtils = require('../app/helpers/db_utils');
const JwtHelper = require('../app/helpers/jwt_helper');
const FacebookTokenStrategy = require('passport-facebook-token');
var GoogleTokenStrategy = require('passport-google-id-token');
const ApiError = require('../app/helpers/api_error');

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
        user.canLogin(username, password).then(function(user){
            if(user){
                return done(null, user);
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
            if(user){
                return cb(null, jwtHelper.getJwtUserObject(user));
            }else{
                return cb(new ApiError('Error getting user details'));
            }
        }).catch((err)=>{
            return cb(err);
        });
         
    }
));

passport.use(new GoogleTokenStrategy({
    clientID: nconf.get('google-client-id')
  },
  async function(parsedToken, googleId, done) {

    console.log(parsedToken);
    console.log('ssss');
    console.log(googleId);
    user = await createSocialUser('google', googleId, parsedToken.payload.email, parsedToken.payload.name, parsedToken.payload.picture);
    return done(null, user);
  }
));

passport.use(new FacebookTokenStrategy({
    clientID: nconf.get('facebook-client-id'),
    clientSecret: nconf.get('facebook-client-secret')
  }, async function(accessToken, refreshToken, profile, done) {
       
        user = await createSocialUser('facebook', profile.id, profile.emails[0].value, profile.displayName, profile.photos[0].value);
        return done(null, user);
  }
));

}

async function createSocialUser(accountType, accountId, email, name, photoUrl){
    console.log(email);
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
      let username = name.split(' ')[0].trim();
      console.log(username);

      while(await users.usernameTaken(username)){
          let randomUsernameString = Math.random().toString(36).slice(-3);
          username = username+randomUsernameString;
      }

      let  randomPasswordString  = Math.random().toString(36).slice(-8);
      user = await users.addUser(username, email, randomPasswordString, photoUrl);
      await socialAccounts.addAccount(accountId, email); // consider refactoring this and the one above
      return user;
  }
}


