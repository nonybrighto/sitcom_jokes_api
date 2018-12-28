const jwt = require('jsonwebtoken');
const nconf = require('../../config/config');

//TODONOW: control how long it takes for a token to expire
class JwtHelper{

    constructor(){
        this.userObjectProp = ['id', 'username', 'email', 'photoUrl'];
    }
    getJwtUserObject(user){

        let jwtUserObject = {}
        //console.log(user);
        this.userObjectProp.forEach((prop)=>{
           // console.log(prop);
            //console.log(user[prop]);
            jwtUserObject[prop] = user[prop];
        });
        
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