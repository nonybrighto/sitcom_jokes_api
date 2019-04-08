var _ = require('lodash');
const Model = require('./model');
const JokeEntity = require('./neo4j/joke_entity');
const UserEntity = require('./neo4j/user_entity');
const MovieEntity = require('./neo4j/movie_entity');
const GeneralHelper = require('./../helpers/general_helper');
const Enums = require('./../models/enums');


class Jokes extends Model{

        constructor(session){
            super(JokeEntity, session);
            this.labels = ['Joke'];
            this.uuidProp = 'title';
        }

        async addJoke(type, title, movieId, content, userId) {
          
            let generalHelper = new GeneralHelper();

            let jokeId = generalHelper.generateUuid(title, true);
            let subJoke = (type == Enums.jokeTypesEnum.imageJoke)? 'ImageJoke': 'TextJoke';
            let queryString = `MATCH(movie:Movie{id:{movieId}}), (owner:User{id:{userId}})
                                CREATE(joke:Joke:${subJoke}{id:{jokeId}, title:{title}, content: {content}, likeCount: 0, commentCount: 0,  dateAdded: apoc.date.format(timestamp())}),
                                (owner)-[:ADDED]->(joke)-[:BELONGS_TO]->(movie) RETURN joke,movie, owner
                        `;
            let result = await this.session.run(queryString, {jokeId:jokeId, movieId: movieId, title:title, content: content, userId: userId});
            if(!_.isEmpty(result.records)){

                let joke =  new JokeEntity(result.records[0].get('joke'), {owner: new UserEntity(result.records[0].get('owner')), movie: new MovieEntity(result.records[0].get('movie'))});
                return joke;
            }else{
                return false;
            }
        }
        async getJokes(type, offset, limit, currentUser){

            let subJoke = (type == Enums.jokeTypesEnum.imageJoke)? 'ImageJoke': 'TextJoke';
            let queryString = `MATCH(joke:Joke:${subJoke}), 
                               (owner:User)-[:ADDED]->(joke)-[:BELONGS_TO]->(movie:Movie)
                               OPTIONAL MATCH 
(currentUserFav:User{id:"bd19684f-6e1d-57c2-b612-1d03fd1d8227"})-[:FAVORITED]->(joke) 
OPTIONAL MATCH 
(currentUserLike:User{id:"bd19684f-6e1d-57c2-b612-1d03fd1d8227"})-[:LIKES]->(joke) 

RETURN joke{.*, favorited:count(currentUserFav) > 0, liked:count(currentUserLike) > 0, jokeType: labels(joke)}, owner, movie SKIP ${offset} LIMIT ${limit}`;

            let result = await this.session.run(queryString, {subJoke: subJoke});
            if(!_.isEmpty(result.records)){
              
              let jokes  = result.records.map((result) => new JokeEntity(result.get('joke'), 
                            {owner: new UserEntity(result.get('owner')), 
                            movie: new MovieEntity(result.get('movie'))}));
              return jokes;

              
            }else{
                return [];
            }
        }

        async getJokesCount(type){
            let subJoke = (type == Enums.jokeTypesEnum.imageJoke)? 'ImageJoke': 'TextJoke';
            let queryString = `MATCH(jokes:Joke:${subJoke}) RETURN count(jokes) as count`;
            let result = await this.session.run(queryString, {subJoke: subJoke});

            return result.records[0].get('count').toNumber();

        }


        async getJoke(jokeId){

            let queryString = 'MATCH (joke:Joke{id:{id}}) , (owner:User)-[:ADDED]->(joke)-[:BELONGS_TO]->(movie:Movie) RETURN joke, owner, movie';
            let result = await this.session.run(queryString, {id: jokeId});

            if(!_.isEmpty(result.records)){
                let joke =  new JokeEntity(result.records[0].get('joke'), {owner: new UserEntity(result.records[0].get('owner')), movie: new MovieEntity(result.records[0].get('movie'))});
                return joke;
            }else{
                return false;
            }
        }
}

module.exports = Jokes;