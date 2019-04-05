const Entity = require('./entity');
class MovieEntity extends Entity{

    constructor(movieModelProperties){
        super(movieModelProperties);
        this.followed = (movieModelProperties.followed != null)?movieModelProperties.followed : false;
   }

}

module.exports = MovieEntity;