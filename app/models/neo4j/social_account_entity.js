const Entity = require('./entity');

class SocialAccountEntity extends Entity{

    //id, dateadded, lastUsed, loginCount
    constructor(_node){
        super(_node);
   }

}

module.exports = SocialAccountEntity;