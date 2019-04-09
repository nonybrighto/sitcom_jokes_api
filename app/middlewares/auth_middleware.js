const passport = require('passport');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 15,
    message:"Too many login attempts, please try again after 5 minutes",
    skipSuccessfulRequests:true
  });

exports.loginLimiter = loginLimiter;
exports.jwtAuthentication = (req, res, next) => {

  passport.authenticate('jwt', {session: false}, (err, user, info) => {

    if (err || !user) {
      return res.status(401).json({
          message: 'Request not authorized'
      });
    }else{
      req.user = user;
    }
  next();
  })(req, res, next);
  
}
exports.jwtOptionalAuthentication = (req, res, next) => {

  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if(user){
      req.user = user;
    }
  next();
  })(req, res, next);
  
}