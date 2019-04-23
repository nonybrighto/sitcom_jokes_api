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

        return jwt.sign(
            jwtUser,
            nconf.get('jwt-secret'),
            {expiresIn: '10 days'}
        );
    }

    sendJwtResponse(res, user, status = 200){
        console.log(user);
        res.status(status).send({token: this.generateJwtToken(user), user: this.getJwtUserObject(user)})
    }
}

module.exports = JwtHelper;