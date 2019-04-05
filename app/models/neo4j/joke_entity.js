var _ = require('lodash');
const Entity = require('./entity');

class JokeEntity extends Entity{

    constructor(jokeModelProperties){
        jokeModelProperties.numFields = ['likeCount', 'commentCount'];
        super(jokeModelProperties);
        this.liked = (jokeModelProperties.isLiked != null) ? jokeModelProperties.liked : false;
        this.favorited = (jokeModelProperties.isFavorited != null) ? jokeModelProperties.favorited : false;
        this.jokeType = this.getJokeType(jokeModelProperties.node.labels);
   }

   getJokeType(label = []){

            return label.includes('TextJoke')? 'text':'image' 
   }




}

module.exports = JokeEntity;