const Entity = require('./entity');
class UserEntity extends Entity{
   
    constructor(userModelProperties, {takenFields = null , hiddenFields = null}={}){
        super({modelProperties: userModelProperties, hiddenFields: hiddenFields || ['password','email'], takenFields: takenFields});
        this.followed = userModelProperties.followed || false;
        this.following = userModelProperties.following || false;
        this.jokeCount = userModelProperties.jokeCount || 0;
        this.followerCount = userModelProperties.followerCount || 0;
        this.followingCount = userModelProperties.followingCount || 0;
   }
}

module.exports = UserEntity;