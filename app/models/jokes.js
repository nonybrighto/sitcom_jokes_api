var _ = require('lodash');
const Model = require('./model');
const JokeEntity = require('./neo4j/joke_entity');
const UserEntity = require('./neo4j/user_entity');
const MovieEntity = require('./neo4j/movie_entity');
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
                                (owner)-[:ADDED]->(joke)-[:BELONGS_TO]->(movie) RETURN joke,movie, owner
                        `;
            let results = await this.session.run(queryString, {jokeId:jokeId, movieId: movieId, title:title, content: content, userId: userId});
            if(!_.isEmpty(results.records)){
                let joke = new JokeEntity(results.records[0].get('joke'));
                joke.owner = new UserEntity({node:results.records[0].get('owner')});
                joke.movie = new MovieEntity(results.records[0].get('movie'));
                return joke;
            }else{
                return false;
            }
        }
        async getJokes(type, offset, limit){

            let subJoke = (type == jokeTypesEnum.imageJoke)? 'ImageJoke': 'TextJoke';
            let queryString = `MATCH(joke:Joke:${subJoke}), 
                               (owner:User)-[:ADDED]->(joke)-[:BELONGS_TO]->(movie:Movie) 
                               RETURN joke, owner, movie SKIP ${offset} LIMIT ${limit}`;

            let results = await this.session.run(queryString, {subJoke: subJoke});
            if(!_.isEmpty(results.records)){
              
              let jokes  = results.records.map((result) => {
                        let joke = new JokeEntity(result.get('joke'));
                        joke.owner = new UserEntity({node:result.get('owner')});
                        return joke;
              });
              return jokes;
            }else{
                return [];
            }
        }

        async getJokesCount(type){
            let subJoke = (type == jokeTypesEnum.imageJoke)? 'ImageJoke': 'TextJoke';
            let queryString = `MATCH(jokes:Joke:${subJoke}) RETURN count(jokes) as count`;
            let results = await this.session.run(queryString, {subJoke: subJoke});

            return results.records[0].get('count').toNumber();

        }


        async getJoke(jokeId){

            let queryString = 'MATCH (joke:Joke{id:{id}}) , (owner:User)-[:ADDED]->(joke)-[:BELONGS_TO]->(movie:Movie) RETURN joke, owner, movie';
            let result = await this.session.run(queryString, {id: jokeId});

            if(!_.isEmpty(result.records)){
                let joke =  new JokeEntity(result.records[0].get('joke'));
                joke.owner =  new UserEntity({node:result.records[0].get('owner')});
                joke.movie =  new MovieEntity(result.records[0].get('movie'));

                return joke;
            }else{
                return false;
            }
        }
}

module.exports = Jokes;