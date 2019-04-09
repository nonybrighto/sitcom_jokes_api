const _ = require('lodash');
const Model = require('./model');
const CommentEntity = require('./neo4j/comment_entity');
const UserEntity = require('./neo4j/user_entity');
const GeneralHelper = require('./../helpers/general_helper');

class Comments extends Model{

        constructor(session){
            super(CommentEntity, session);
            this.labels = ['Movie'];
            this.uuidProp = 'content';
        }

        async addComment(jokeId, content, userId){

        
            let tx = this.session.beginTransaction(); 
            let canCommit = true;
            let comment;

            let generalHelper = new GeneralHelper();

            let commentId = generalHelper.generateUuid(userId, true);
            let queryString = `MATCH(joke:Joke{id:{jokeId}}), (owner:User{id:{userId}})
            CREATE (comment:Comment{id: {commentId}, content:{content}}),
            (owner)-[cmt:COMMENTED{dateAdded:apoc.date.format(timestamp())}]->(comment)<-[:HAS_COMMENT]-(joke) RETURN comment{.*, dateAdded: cmt.dateAdded }, owner`;

            let result = await tx.run(queryString, {commentId:commentId, jokeId:jokeId, userId:userId, content:content});
            if(_.isEmpty(result.records)){
                canCommit = false;
            }else{
                comment =  new CommentEntity(result.records[0].get('comment'), {owner: new UserEntity(result.records[0].get('owner'))});
            }

            let updateCountQueryString = `MATCH(joke:Joke{id:{jokeId}}) SET joke.commentCount = joke.commentCount + 1 RETURN 1`;
            let updateCountResult = await tx.run(updateCountQueryString, {jokeId:jokeId});
            if(_.isEmpty(updateCountResult.records)){
                canCommit = false;
            }

           if(canCommit){
                await tx.commit();
                return comment;
           }
           return false;
        }

        async getComments(jokeId, offset, limit){

            let queryString = `MATCH(owner:User)-[cmt:COMMENTED]->(comment:Comment)<-[:HAS_COMMENT]-(joke:Joke{id:{jokeId}})
                               RETURN comment{.*, dateAdded: cmt.dateAdded}, owner SKIP ${offset} LIMIT ${limit}`;

            let result = await this.session.run(queryString, {jokeId: jokeId});
            if(!_.isEmpty(result.records)){
              let comments  = result.records.map((result) => {
                let comment = new CommentEntity(result.get('comment'), {owner: new UserEntity(result.get('owner'))});
                return comment;
              });
              return comments;
            }else{
                return [];
            }
        }

        async getCommentsCount(jokeId){
            let queryString = `MATCH (comment:Comment)<-[:HAS_COMMENT]-(joke:Joke{id:{jokeId}}) RETURN count(comment) as count`;
            let result = await this.session.run(queryString, {jokeId: jokeId});
            return result.records[0].get('count').toNumber();
        }
}

module.exports = Comments;