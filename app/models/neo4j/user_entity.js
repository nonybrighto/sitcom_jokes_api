const Entity = require('./entity');
class UserEntity extends Entity{
   
    constructor(userModelProperties, {takenFields = null , hiddenFields = null}={}){
        super({modelProperties: userModelProperties, hiddenFields: hiddenFields || ['password','email'], takenFields: takenFields});
   }
}

module.exports = UserEntity;