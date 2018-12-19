const JwtHelper = require('../helpers/jwt_helper');
const passport = require('passport');


module.exports.login = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {

        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Login failed',
                user: user
            });
        }

        req.login(user, { session: false }, (err) => {
            if (err) {
                res.send(err);
            }
            let jwtHelper = new JwtHelper();
            //let token = jwtHelper.generateJwtToken(user);

            //return res.json({ token: token, user: user });
            jwtHelper.sendJwtResponse(res, user);
        });
    })(req, res, next);

}

//TODO: Implemen

module.exports.googleIdTokenAuth = (err, req, res, next) => {

    passport.authenticate('google-id-token', { session: false },
        (err, user, info) => {
            // res.send(req.user);
            console.log('ddd');
        })(err, req, res, next);
}

//TODO: Implement
module.exports.facebookTokenAuth = (req, res, next) => {

    passport.authenticate('facebook-token', { session: false },
        (err, user, info) => {
            // do something with user
            return res.json({ token: '1234567' });
        })(req, res, next);

}