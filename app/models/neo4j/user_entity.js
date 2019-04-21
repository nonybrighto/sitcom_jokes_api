const Entity = require('./entity');
class UserEntity extends Entity{
   
    constructor(userModelProperties, {takenFields = null , hiddenFields = null}={}){
        super({modelProperties: userModelProperties, hiddenFields: hiddenFields || ['password','email'], takenFields: takenFields, numFields: ['jokeCount', 'followerCount', 'followingCount']});
        this.followed = userModelProperties.followed || false;
        this.following = userModelProperties.following || false;
   }

  

       
}

module.exports = UserEntity;