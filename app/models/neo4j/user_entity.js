const Entity = require('./entity');
//TODO: Dont send out sensitive info to the user such as password
class UserEntity extends Entity{

    constructor(_node){
        super(_node, ['klout'], ['password']);
   }

}

module.exports = UserEntity;