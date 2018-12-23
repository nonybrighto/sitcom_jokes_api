const _ = require('lodash');
const Model = require('./model');
const CommentEntity = require('./neo4j/comment_entity');
const GeneralHelper = require('./../helpers/general_helper');

class Comments extends Model{

        constructor(session){
            super(CommentEntity, session);
            this.labels = ['Movie'];
            this.uuidProp = 'content';
        }

        async addComment(jokeId, content, userId){

            
            let generalHelper = new GeneralHelper();

            let commentId = generalHelper.generateUuid(userId, true);

            // let queryString = `MATCH(joke:Joke{id:{jokeId}}), (user:User{id:{userId}})
            //                    CREATE (comment:Comment{id:${commentId}, content:{content}, dateAdded: apoc.date.format(timestamp())}),
            //                    (user)-[:COMMENTED]->(comment)<-[:HAS_COMMENT]-(joke)`;

            let queryString = `MATCH(joke:Joke{id:{jokeId}}), (user:User{id:{userId}})
            CREATE (comment:Comment{id: {commentId}, content:{content}, dateAdded:  apoc.date.format(timestamp())}),
            (user)-[:COMMENTED]->(comment)<-[:HAS_COMMENT]-(joke) RETURN comment`;
            let result = await this.session.run(queryString, {commentId:commentId, jokeId:jokeId, userId:userId, content:content});

            if(!_.isEmpty(result.records)){
                let comment =  new CommentEntity(result.records[0].get('comment'));
                return comment;
            }else{
                return false;
            }
        }
}

module.exports = Comments;