var _ = require('lodash');
const Entity = require('./entity');
var nconf = require('./../../../config/config');

class JokeEntity extends Entity{

    constructor(jokeModelProperties, {owner, movie, hiddenFields = null, takenFields = null}){
        super({modelProperties: jokeModelProperties, numFields: ['likeCount', 'commentCount'], hiddenFields: hiddenFields, takenFields: takenFields});
       
        this.liked = this.liked || false;
        this.favorited =  this.favorited || false; 
        this.owner = owner;
        this.movie = movie;
        if(this.imageUrl){
            this.imageUrl = nconf.get('base-url')+this.imageUrl;
        }
   }
}

module.exports = JokeEntity;