const Entity = require('./entity');

class PasswordTokenEntity extends Entity{

   constructor(passwordModelProperties, {hiddenFields = null, takenFields = null}={}){
      super({modelProperties: passwordModelProperties, hiddenFields: hiddenFields, takenFields: takenFields});
   }

}

module.exports = PasswordTokenEntity;