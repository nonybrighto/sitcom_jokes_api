const Entity = require('./entity');
var nconf = require('./../../../config/config');
class UserEntity extends Entity{
   
    constructor(userModelProperties, {takenFields = null , hiddenFields = null}={}){
        super({modelProperties: userModelProperties, hiddenFields: hiddenFields || ['password','email'], takenFields: takenFields, numFields: ['jokeCount', 'followerCount', 'followingCount']});
        this.followed = userModelProperties.followed || false;
        this.following = userModelProperties.following || false;
        this.photoUrl = userModelProperties.photoUrl || (nconf.get('base-url')+'uploads/default/profile_photo.jpg');
   }

  

       
}

module.exports = UserEntity;