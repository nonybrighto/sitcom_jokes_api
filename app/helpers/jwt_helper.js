const jwt = require('jsonwebtoken');
const nconf = require('../../config/config');

//TODONOW: control how long it takes for a token to expire
class JwtHelper{

    constructor(){
        this.userObjectProp = ['id', 'username', 'email'];
    }
    getJwtUserObject(user){

        let jwtUserObject = {}
    
        this.userObjectProp.forEach((prop)=>{
            jwtUserObject[prop] = user[prop];
        });
    
        return jwtUserObject;
    }

    generateJwtToken(user) {
        
        let jwtUser = this.getJwtUserObject(user);

        return jwt.sign(
            jwtUser,
            nconf.get('jwt-secret')
        );
    }

    sendJwtResponse(res, user, status = 200){
        
        res.status(status).send({token: this.generateJwtToken(user), user: this.getJwtUserObject(user)})
    }
}

module.exports = JwtHelper;