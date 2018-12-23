const Entity = require('./entity');

class JokeEntity extends Entity{

    constructor(_node){
        super(_node, ['likes']);
   }

}

module.exports = JokeEntity;