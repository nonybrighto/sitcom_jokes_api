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

            let queryString = `MATCH (movie:Movie{id:{movieId}}) 
                               OPTIONAL MATCH
                               (currentUser:User{id:{currentUserId}})-[:FOLLOWS_MOVIE]->(movie)
                               RETURN movie{.*, followed: count(currentUser) > 0 }`;
            let result = await this.session.run(queryString, {movieId: movieId, currentUserId: currentUserId});

            if(!_.isEmpty(result.records)){
                let movie =  new MovieEntity(result.records[0].get('movie'));
                return movie;
            }else{
                return false;
            }
        }

        async followMovie(movieId, currentUserId){

            let tx = this.session.beginTransaction(); 
            let canCommit = true;

            let followQuery = `MATCH(user:User{id:{currentUserId}}), (movie:Movie{id:{movieId}}) MERGE (user)-[follows:FOLLOWS]->(movie) ON CREATE SET follows.dateAdded = apoc.date.format(timestamp()) RETURN 1`;
            
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

            let unfollowQuery = `MATCH(user:User{id:{currentUserId}})-[follows:FOLLOWS]->(movie:Movie{id:{movieId}}) DELETE follows RETURN 1`;
            
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

            let queryString = `MATCH(user:User{id:{userId}})-[:FOLLOWS]->(movie:Movie{id:{movieId}}) RETURN 1`;
            let result = await this.session.run(queryString, {movieId: movieId, userId: userId});

            if(_.isEmpty(result.records)){
                return false;
            }else{
                return true;
            }

        }
}

module.exports = Movies;