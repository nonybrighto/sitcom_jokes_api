const Entity = require('./entity');
class MovieEntity extends Entity{

    constructor(movieModelProperties, {hiddenFields = null, takenFields = null}={}){
        super({modelProperties: movieModelProperties, numFields: ['tmdbMovieId','followerCount', 'textJokeCount', 'imageJokeCount']});
        this.followed = movieModelProperties.followed || false;
   } 

}

module.exports = MovieEntity;