const passport = require('passport');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 15,
    message:"Too many login attempts, please try again after 5 minutes",
    skipSuccessfulRequests:true
  });

exports.loginLimiter = loginLimiter;
exports.isJwtAuthenticated = passport.authenticate('jwt', {session: false});