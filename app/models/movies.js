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

        async getMovie(movieId){

            let queryString = 'MATCH (movie:Movie{id:{id}}) RETURN movie';
            let result = await this.session.run(queryString, {id: movieId});

            if(!_.isEmpty(result.records)){
                let movie =  new MovieEntity(result.records[0].get('movie'));
                return movie;
            }else{
                return false;
            }
        }
}

module.exports = Movies;