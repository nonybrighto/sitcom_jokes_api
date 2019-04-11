const _ = require('lodash');
const Model = require('./model');
const MovieEntity = require('./neo4j/movie_entity');
const GeneralHelper = require('./../helpers/general_helper');

class Movies extends Model{

        constructor(session){
            super(MovieEntity, session);
            this.labels = ['Movie'];
            this.uuidProp = 'title';
        }

        async getMovie(movieId, currentUserId){

            let followQueryString = '';
            let followReturnString = '';
            if(currentUserId){
                followQueryString = ` OPTIONAL MATCH(currentUser:User{id:{currentUserId}})-[:FOLLOWS_MOVIE]->(movie) `;
                followReturnString = `, followed: count(currentUser) > 0 `;
            }

            let queryString = `MATCH (movie:Movie{id:{movieId}}) 
                               ${followQueryString}
                               RETURN movie{.* ${followReturnString}}`;
            let result = await this.session.run(queryString, {movieId: movieId, currentUserId: currentUserId});

            if(!_.isEmpty(result.records)){
                let movie =  new MovieEntity(result.records[0].get('movie'));
                return movie;
            }else{
                return false;
            }
        }


        async getMovies(currentUserId, offset, limit){

            let followQueryString = '';
            let followReturnString = '';
            let paramObject = {};

            if(currentUserId){
                followQueryString = ` OPTIONAL MATCH(currentUser:User{id:{currentUserId}})-[:FOLLOWS_MOVIE]->(movie) `;
                followReturnString = `, followed: count(currentUser) > 0`;
                paramObject = {...paramObject, ...{currentUserId: currentUserId}};
            }

            let queryString = `MATCH(movie:Movie) 
                               ${followQueryString}
                               RETURN movie{.* ${followReturnString}} SKIP ${offset} LIMIT ${limit}`;
            
            let result = await this.session.run(queryString, paramObject);
            if(!_.isEmpty(result.records)){
                
                let movies  = result.records.map((result) => new MovieEntity(result.get('movie')));
                return movies;
            }else{
                return [];
            }

        }

        async getmovieCount(){

            let queryString = `MATCH(movie:Movie) RETURN count(movie) as count`;
            let result = await this.session.run(queryString);
            return result.records[0].get('count').toNumber();
        }

        async followMovie(movieId, currentUserId){

            let tx = this.session.beginTransaction(); 
            let canCommit = true;

            let followQuery = `MATCH(user:User{id:{currentUserId}}), (movie:Movie{id:{movieId}}) MERGE (user)-[follows:FOLLOWS_MOVIE]->(movie) ON CREATE SET follows.dateAdded = apoc.date.format(timestamp()) RETURN 1`;
            
            let followQueryResult = await tx.run(followQuery, {currentUserId:currentUserId, movieId: movieId});
            if(!_.isEmpty(followQueryResult.records)){
                
                let increaseCountQueryString = `MATCH(movie:Movie{id:{movieId}}) SET movie.followerCount = movie.followerCount + 1 RETURN 1`;
                let increaseCountQueryResult = await tx.run(increaseCountQueryString, {movieId: movieId});
                if(_.isEmpty(increaseCountQueryResult.records)){
                    canCommit = false;
                }
                
            }else{
                canCommit = false;
            }

            if(canCommit){
                await tx.commit();
                return true;
            }
            return false;

            
        }
        async unfollowMovie(movieId, currentUserId){

            let tx = this.session.beginTransaction(); 
            let canCommit = true;

            let unfollowQuery = `MATCH(user:User{id:{currentUserId}})-[follows:FOLLOWS_MOVIE]->(movie:Movie{id:{movieId}}) DELETE follows RETURN 1`;
            
            let unfollowQueryResult = await tx.run(unfollowQuery, {currentUserId:currentUserId, movieId: movieId});
            if(!_.isEmpty(unfollowQueryResult.records)){
                
                let increaseCountQueryString = `MATCH(movie:Movie{id:{movieId}}) SET movie.followerCount = movie.followerCount - 1  RETURN 1`;
                let increaseCountQueryResult = await tx.run(increaseCountQueryString, {movieId: movieId});
                if(_.isEmpty(increaseCountQueryResult.records)){
                    canCommit = false;
                }
            }else{
                canCommit = false;
            }

            if(canCommit){
                await tx.commit();
                return true;
            }

        }

        async getmovieJokesCount(movieId){

            let queryString = `MATCH(joke)-[:BELONGS_TO]->(movie:Movie{id:{movieId}})  RETURN count(joke) as count`;
            let result = await this.session.run(queryString, {movieId:movieId});
            return result.records[0].get('count').toNumber();
        }

        async isMovieFollowed(movieId, userId){

            let queryString = `MATCH(user:User{id:{userId}})-[:FOLLOWS_MOVIE]->(movie:Movie{id:{movieId}}) RETURN 1`;
            let result = await this.session.run(queryString, {movieId: movieId, userId: userId});

            if(_.isEmpty(result.records)){
                return false;
            }else{
                return true;
            }

        }
}

module.exports = Movies;