var _ = require('lodash');
const bcrypt = require('bcrypt');
const Model = require('./model');
const JokeEntity = require('./neo4j/joke_entity');
const UserEntity = require('./neo4j/user_entity');
const MovieEntity = require('./neo4j/movie_entity');
const EmailHelper = require('../helpers/email_helper');
const Enums = require('./../models/enums');



class Users extends Model{

        constructor(session){
            super(UserEntity, session);
            this.labels = ['User'];
            this.uuidProp = 'username';
        }

        async addUser(username, email, password, photoUrl = null) {
            
            const saltRounds = 10;
            let passwordHash = await bcrypt.hash(password, saltRounds)
            let userProp = {username:username, email:email, password:passwordHash};
            if(photoUrl != null){
                userProp.photoUrl = photoUrl;
            }
           return await super.add({prop: userProp, takenFields:['id', 'username', 'email', 'password', 'photoUrl']});

        }

        async getAllUsers(){

            let allUsers = await super.getAll();
            return allUsers;
        }

        async getUserJokes(type, offset, limit, currentUserId,userId){

            let likeQueryString  = (currentUserId) ? `OPTIONAL MATCH 
            (currentUserFav:User{id:{currentUserId}})-[:FAVORITED]->(joke) 
            OPTIONAL MATCH 
            (currentUserLike:User{id:{currentUserId}})-[:LIKES]->(joke) `: '';
            let likeReturnString = (currentUserId)?'favorited:count(currentUserFav) > 0, liked:count(currentUserLike) > 0,':'';
            let paramObject = (currentUserId)?{currentUserId: currentUserId}: {};
            let subJoke = (type == Enums.jokeTypesEnum.imageJoke)? 'ImageJoke': 'TextJoke';

                paramObject = {...paramObject, ...{userId: userId}};
        
            let queryString = `MATCH(joke:Joke:${subJoke}), 
                            (owner:User{id:{userId}})-[:ADDED]->(joke)-[:BELONGS_TO]->(movie:Movie)
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

        async getUserJokesCount(type, userId){

            let subJoke = (type == Enums.jokeTypesEnum.imageJoke)? 'ImageJoke': 'TextJoke';
            let queryString = `MATCH(user:User{id:{userId}})-[:ADDED]->(jokes:Joke:${subJoke}) RETURN count(jokes) as count`;
            let result = await this.session.run(queryString, {userId:userId});

            return result.records[0].get('count').toNumber();
        }

        async getFavoriteJokesCount(userId){

            let queryString = `MATCH(user:User{id:{userId}})-[:FAVORITED]->(joke:Joke) RETURN count(joke) as count`;

            let result = await this.session.run(queryString, {userId: userId});
            return result.records[0].get('count').toNumber();
        }


        async getFavoriteJokes(userId, offset, limit){

            let queryString = `MATCH(user:User{id:{userId}})-[fav:FAVORITED]->(joke:Joke) , (owner)-[:ADDED]->(joke)-[:BELONGS_TO]->(movie) 
            OPTIONAL MATCH 
                    (userLike:User{id:{userId}})-[:LIKES]->(joke)
            RETURN joke{.*, favorited:true, liked:count(userLike) > 0 }, owner, movie ORDER BY fav.dateAdded DESC SKIP ${offset} LIMIT ${limit}`;


            let result = await this.session.run(queryString, {userId: userId});
            if(!_.isEmpty(result.records)){
              
              let jokes  = result.records.map((result) => new JokeEntity(result.get('joke'), 
                            {owner: new UserEntity(result.get('owner')), 
                            movie: new MovieEntity(result.get('movie'))}));
              return jokes;

            }else{
                return [];
            }



        }

        async addJokeToFavorite(userId, jokeId){

                let queryString = `MATCH(user:User{id:{userId}}), (joke:Joke{id:{jokeId}}) MERGE (user)-[fav:FAVORITED]->(joke) ON CREATE SET fav.dateAdded = apoc.date.format(timestamp())  RETURN 1`;

                let result = await this.session.run(queryString, {userId:userId, jokeId: jokeId});
                if(!_.isEmpty(result.records)){
                   return true;
                }else{
                   return false;
                }

        }

        async removeJokeFromFavorite(userId, jokeId){

            let queryString = `MATCH(user:User{id:{userId}})-[r:FAVORITED]->(joke:Joke{id:{jokeId}}) DELETE r RETURN 1`;

            let result = await this.session.run(queryString, {userId:userId, jokeId: jokeId});
            if(!_.isEmpty(result.records)){
                return true;
            }else{
               return false;
            }
            
        }

        async likeJoke(jokeId, currentUserId){

            let tx = this.session.beginTransaction(); 
            let canCommit = true;
            
            try{
            if(currentUserId){
                let userLikeQueryString = `MATCH(user:User{id:{userId}}), (joke:Joke{id:{jokeId}}) MERGE (user)-[like:LIKES]->(joke) ON CREATE SET like.dateAdded = apoc.date.format(timestamp()) RETURN 1`;
                let userLikeresult = await tx.run(userLikeQueryString, {userId:currentUserId, jokeId: jokeId});
                if(_.isEmpty(userLikeresult.records)){
                    canCommit = false;
                }
            }

                let increaseLikeCountString = `MATCH(joke:Joke{id:{jokeId}}) SET joke.likeCount = joke.likeCount + 1 RETURN 1`;
                let increaseLikeResult = await tx.run(increaseLikeCountString, {jokeId: jokeId});
                if(_.isEmpty(increaseLikeResult.records)){
                    canCommit = false;
                }
            }catch(error){
                canCommit = false;
            }

            if(canCommit){
                try{
                await tx.commit();
                return true;
                }catch(err){
                    return false;
                }
            }
            return false;

        }

        async unlikeJoke(jokeId, currentUserId){

            let tx = this.session.beginTransaction(); 
            let canCommit = true;

            try{
                let userUnlikeQueryString = `MATCH(user:User{id:{userId}})-[like:LIKES]->(joke:Joke{id:{jokeId}}) DELETE like RETURN 1`;
                let userUnlikeResult = await tx.run(userUnlikeQueryString, {userId:currentUserId, jokeId: jokeId});
                if(!_.isEmpty(userUnlikeResult.records)){

                    let decreaseLikeCountString = `MATCH(joke:Joke{id:{jokeId}}) SET joke.likeCount = joke.likeCount - 1 RETURN 1`;
                    let decreaseLikeResult = await tx.run(decreaseLikeCountString, {jokeId: jokeId});
                    if(_.isEmpty(decreaseLikeResult.records)){
                        canCommit = false;
                    }
                    
                }else{
                    canCommit = false;
                }

            }catch(error){
                canCommit = false;
            }

            if(canCommit){
                try{
                    await tx.commit();
                    return true;
                }catch(err){
                    return false;
                }
            }
            return false;

        }

        async canLogin(credential, password){

            //TODO:allow both username and email login
            let emailHelper = new EmailHelper();
            let user = '';
            if(emailHelper.isValidEmail(credential)){
                user = await super.get({prop:{email:credential}, takenFields:['id', 'username', 'email', 'password', 'photoUrl']});
            }else{
                user = await super.get({prop:{username:credential}, takenFields:['id','username', 'email', 'password', 'photoUrl']});
            }
            if(user){
                let passwordHash = user.password;
                let passwordMatch = await bcrypt.compare(password, passwordHash);
                if(passwordMatch){
                    return user;
                }else{
                    return false;
                }
            }else{
                return false;
            }
        }

        async isEmailTaken(email){
            let userWithEmail = await super.get({prop:{email:email}});
            if(userWithEmail){
                return true;
            }
            return false;
        }

        async usernameTaken(username){
            let userWithUsername = await super.get({prop:{username:username}});
            if(userWithUsername){
                return true;
            }else{
                return false;
            }
        }


        async changePassword(userId, newPassword){
            const saltRounds = 10;
            let passwordHash = await bcrypt.hash(newPassword, saltRounds);


            let passwordChange = await super.update({prop:{id:userId}, update:{password:passwordHash}, return:['id']});

            if(passwordChange){
                return true;
            }else{
                return false;
            }

        }

        async getPasswordTokenOwner(tokenId){

            let query = `MATCH(passwordToken:PasswordToken{tokenId:{tokenId}})-[:PASSWORD_TOKEN_FOR]->(user:User) 
                        RETURN user 
                        LIMIT 1`;

            let results = await this.session.run(query, {tokenId: tokenId});
            if(!_.isEmpty(results.records)){
                    return new UserEntity(results.records[0].get('user'));
            }else{
                return false;
            }
            
        }
}

module.exports = Users;