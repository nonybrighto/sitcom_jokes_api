const jwt = require('jsonwebtoken');
const nconf = require('../../config/config');
var _ = require('lodash');

//TODONOW: control how long it takes for a token to expire
class JwtHelper{

    constructor(){
        this.propToRemove = ['password'];
    }
    getJwtUserObject(user){

        let jwtUserObject = _.omit(user, this.propToRemove);
        return jwtUserObject;
    }

    generateJwtToken(user) {
        
        let jwtUser = this.getJwtUserObject(user);
        let expireDays = nconf.get('jwt_token-expire-days');

        return jwt.sign(
            jwtUser,
            nconf.get('jwt-secret'),
            {expiresIn: expireDays+' days'}
        );
    }

    sendJwtResponse(res, user, status = 200){
        console.log(user);
        let expireDays = nconf.get('jwt_token-expire-days');
        let expirationDate = new Date();
        expirationDate.setDate(new Date().getDate() + expireDays);
        
        res.status(status).send({token: this.generateJwtToken(user), tokenExpires: expirationDate, user: this.getJwtUserObject(user)})
    }
}

module.exports = JwtHelper;