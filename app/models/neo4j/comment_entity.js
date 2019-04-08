const Entity = require('./entity');

class CommentEntity extends Entity{

    constructor(commentModelProperties, {owner,  hiddenFields = null, takenFields = null}){
        super({modelProperties:commentModelProperties, hiddenFields: hiddenFields, takenFields: takenFields});
        this.owner = owner;
   }

}

module.exports = CommentEntity;