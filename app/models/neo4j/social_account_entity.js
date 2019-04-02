const Entity = require('./entity');

class SocialAccountEntity extends Entity{

    //id, dateadded, lastUsed, loginCount
    constructor(socialAccountModelProperties){
        super(socialAccountModelProperties);
   }

}

module.exports = SocialAccountEntity;