const Entity = require('./entity');
class UserEntity extends Entity{
    constructor(userModelProperties){
        userModelProperties.hiddenFields = ['password','email'];
        userModelProperties.numFields = [];
        super(userModelProperties);
   }
}

module.exports = UserEntity;