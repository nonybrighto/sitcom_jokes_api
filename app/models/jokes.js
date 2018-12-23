var _ = require('lodash');
const Model = require('./model');
const JokeEntity = require('./neo4j/joke_entity');
const UserEntity = require('./neo4j/user_entity');
const GeneralHelper = require('./../helpers/general_helper');

const jokeTypesEnum = Object.freeze({imageJoke: 'imageJoke', textJoke: 'textJoke'});

class Jokes extends Model{

        constructor(session){
            super(JokeEntity, session);
            this.labels = ['Joke'];
            this.uuidProp = 'title';
        }

        async addJoke(type, title, movieId, content, userId) {
          
            let generalHelper = new GeneralHelper();

            let jokeId = generalHelper.generateUuid(title, true);
            let subJoke = (type == jokeTypesEnum.imageJoke)? 'ImageJoke': 'TextJoke';
            let jokeProp = (type == jokeTypesEnum.imageJoke)? 'url' : 'text';
            let queryString = `MATCH(movie:Movie{id:{movieId}}), (owner:User{id:{userId}})
                                CREATE(joke:Joke:${subJoke}{id:{jokeId}, title:{title}, ${jokeProp}: {content}, likes: 0, dateAdded: apoc.date.format(timestamp())}),
                                (user)-[:ADDED]->(joke)-[:BELONGS_TO]->(movie) RETURN joke,movie, owner
                        `;
            let results = await this.session.run(queryString, {jokeId:jokeId, movieId: movieId, title:title, content: content, userId: userId});
            if(!_.isEmpty(results.records)){
                let joke = new JokeEntity(results.records[0].get('joke'));
                joke.owner = new UserEntity(results.records[0].get('owner'));
                //joke.movie = new MovieEntity(results.records[0].get('movie'));
                return joke;
            }else{
                return false;
            }
           
           //TODO: return true or false
        }
}

module.exports = Jokes;