const Entity = require('./entity');
class MovieEntity extends Entity{

    constructor(movieModelProperties, {hiddenFields = null, takenFields = null}={}){
        super({modelProperties: movieModelProperties, hiddenFields: hiddenFields, takenFields: takenFields, numFields: ['tmdbMovieId','followerCount', 'jokeCount']});
        this.followed = movieModelProperties.followed || false;
   } 

}

module.exports = MovieEntity;