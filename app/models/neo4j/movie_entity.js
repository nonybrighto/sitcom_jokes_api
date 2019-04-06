const Entity = require('./entity');
class MovieEntity extends Entity{

    constructor(movieModelProperties){
        movieModelProperties.numFields = ['tmdbMovieId'];
        super(movieModelProperties);
        this.followed = (movieModelProperties.followed != null)?movieModelProperties.followed : false;
   }

}

module.exports = MovieEntity;