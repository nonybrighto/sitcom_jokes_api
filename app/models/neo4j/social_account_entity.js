const Entity = require('./entity');

class SocialAccountEntity extends Entity{

    //id, dateadded, lastUsed, loginCount
    constructor(socialAccountModelProperties, {hiddenFields = null, takenFields = null}={}){
        super({modelProperties:socialAccountModelProperties, hiddenFields: hiddenFields, takenFields: takenFields});
   }

}

module.exports = SocialAccountEntity;