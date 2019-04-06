var _ = require('lodash');
const Entity = require('./entity');
const Enum = require('./../../models/enums');
var nconf = require('./../../../config/config');

class JokeEntity extends Entity{

    constructor(jokeModelProperties){
        jokeModelProperties.numFields = ['likeCount', 'commentCount'];
        super(jokeModelProperties);
        this.liked = (jokeModelProperties.isLiked != null) ? jokeModelProperties.liked : false;
        this.favorited = (jokeModelProperties.isFavorited != null) ? jokeModelProperties.favorited : false;
        this.jokeType = this.getJokeType(jokeModelProperties.node.labels);
        if(this.jokeType == Enum.jokeTypesEnum.imageJoke){
            this.content = nconf.get('base-url')+this.content;
        }
   }

   getJokeType(label = []){

            return label.includes('TextJoke')? Enum.jokeTypesEnum.textJoke:Enum.jokeTypesEnum.imageJoke; 
   }




}

module.exports = JokeEntity;