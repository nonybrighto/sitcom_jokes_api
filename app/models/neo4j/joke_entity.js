const Entity = require('./entity');

class JokeEntity extends Entity{

    constructor(jokeModelProperties){
        jokeModelProperties.numFields = ['likes'];
        super(jokeModelProperties);
   }

}

module.exports = JokeEntity;