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
        async getJokes(type, offset, limit, currentUserId){

            let likeQueryString  = (currentUserId) ? `OPTIONAL MATCH 
                    (currentUserFav:User{id:{currentUserId}})-[:FAVORITED]->(joke) 
                    OPTIONAL MATCH 
                    (currentUserLike:User{id:{currentUserId}})-[:LIKES]->(joke) `: '';
            let likeReturnString = (currentUserId)?'favorited:count(currentUserFav) > 0, liked:count(currentUserLike) > 0,':'';
            let paramObject = (currentUserId)?{currentUserId: currentUserId}: {};

            let subJoke = (type == Enums.jokeTypesEnum.imageJoke)? 'ImageJoke': 'TextJoke';
           
            let queryString = `MATCH(joke:Joke:${subJoke}), 
                               (owner:User)-[:ADDED]->(joke)-[:BELONGS_TO]->(movie:Movie)
                                ${likeQueryString}
                                RETURN joke{.*, ${likeReturnString} jokeType: labels(joke)}, owner, movie SKIP ${offset} LIMIT ${limit}`;

            let result = await this.session.run(queryString, paramObject);
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

        async getJokeLikers(jokeId,  offset, limit){

            let queryString = `MATCH (user:User)-[:LIKES]->(joke:Joke{id: {jokeId} }) RETURN user SKIP ${offset} LIMIT ${limit}`;

            let result = await this.session.run(queryString, {jokeId: jokeId});
            if(!_.isEmpty(result.records)){
              
              let users  = result.records.map((result) => new UserEntity(result.get('user')));
              return users;
            }else{
                return [];
            }
        }

        async getJokeLikesCount(jokeId){

            let queryString = `MATCH (user:User)-[:LIKES]->(joke:Joke{id: {jokeId} }) RETURN count(user) as count`;
            let result = await this.session.run(queryString, {jokeId: jokeId});
            return result.records[0].get('count').toNumber();
        }
}

module.exports = Jokes;