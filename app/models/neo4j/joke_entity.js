var _ = require('lodash');
const Entity = require('./entity');
const Enum = require('./../../models/enums');
var nconf = require('./../../../config/config');

class JokeEntity extends Entity{

    constructor(jokeModelProperties, {owner, movie, hiddenFields = null, takenFields = null}){
        super({modelProperties: jokeModelProperties, numFields: ['likeCount', 'commentCount'], hiddenFields: hiddenFields, takenFields: takenFields});
       
        this.liked = this.liked || false;
        this.favorited =  this.favorited || false; 
        this.owner = owner;
        this.movie = movie;
        this.jokeType = this.getJokeType(this.jokeType || jokeModelProperties.labels);
        if(this.jokeType == Enum.jokeTypesEnum.imageJoke){
            this.content = nconf.get('base-url')+this.content;
        }
        if(this.jokeType == Enum.jokeTypesEnum.imageJoke){
            this.imageUrl = nconf.get('base-url')+this.imageUrl;
        }
   }

   getJokeType(labels = []){
            return labels.includes('ImageJoke')? Enum.jokeTypesEnum.imageJoke:Enum.jokeTypesEnum.textJoke; 
   }




}

module.exports = JokeEntity;