const _ = require('lodash');
const bcrypt = require('bcrypt');
const Model = require('./model');
const JokeEntity = require('./neo4j/joke_entity');
const UserEntity = require('./neo4j/user_entity');
const MovieEntity = require('./neo4j/movie_entity');
const EmailHelper = require('../helpers/email_helper');
const GeneralHelper = require('./../helpers/general_helper');

class Users extends Model {

    constructor(session) {
        super(UserEntity, session);
        this.labels = ['User'];
        this.uuidProp = 'username';
    }

    async addUser(username, email, password, photoUrl = null) {


        let generalHelper = new GeneralHelper();

        const saltRounds = 10;
        let passwordHash = await bcrypt.hash(password, saltRounds);
        let userId = generalHelper.generateUuid(username, true);
        let photoUrlString = '';
        if (photoUrl != null) {
            photoUrlString = ', photoUrl:{photoUrl}';
            userProp.photoUrl = photoUrl;
        }

        let queryString = `CREATE(user:User{id:{userId}, username:{username}, email:{email}, password:{password} ${photoUrlString}, followerCount:0, followingCount:0, jokeCount:0}) return user`;

        let result = await this.session.run(queryString, {username: username, email: email, password: passwordHash, userId: userId});
        if (!_.isEmpty(result.records)) {
            return new UserEntity(result.records[0].get('user'), { takenFields: ['*'] });
        } else {
            return false;
        }

    }

    async getAllUsers(offset, limit) {

        let queryString = `MATCH(user:User) RETURN user SKIP ${offset} LIMIT ${limit}`;

        let result = await this.session.run(queryString);
        if (!_.isEmpty(result.records)) {

            let user = result.records.map((result) => new UserEntity(result.get('user')));
            return user;
        } else {
            return [];
        }
    }

    async getAllUsersCount() {

        let queryString = `MATCH(user:User) RETURN count(user) as count `;
        let result = await this.session.run(queryString);
        return result.records[0].get('count').toNumber();

    }

    async getUser(userId, currentUserId) {

        let followQueryString = '';
        let followReturnString = '';
        let paramObject = {};

        if (currentUserId && currentUserId !== userId) {
            followQueryString = ` OPTIONAL MATCH(currentUser:User{id:{currentUserId}})-[:FOLLOWS_USER]->(follower) 
                                      OPTIONAL MATCH(:User{id:{currentUserId}})<-[following:FOLLOWS_USER]-(follower) `;
            followReturnString = `, followed: count(currentUser) > 0, following: count(following) > 0`;
            paramObject = { currentUserId: currentUserId };
        }

        let queryString = `MATCH(user{id:{userId}}) 
                           ${followQueryString} 
                           RETURN user{.* ${followReturnString}}`;
        let result = await this.session.run(queryString, { userId: userId, ...paramObject});
        if (!_.isEmpty(result.records)) {
            return new UserEntity(result.records[0].get('user'));
        } else {
            return false;
        }


    }

    async getUserPhotoUrl(userId){

        let queryString = 'MATCH(user:User{id:{userId}}) RETURN user.photoUrl as photoUrl';
        let result = await this.session.run(queryString, { userId: userId});
        if (!_.isEmpty(result.records)) {
            return result.records[0].get('photoUrl');
        } else {
            return false;
        }
    }
    
    async changeUserPhotoUrl(userId, photoUrl){

        let queryString = 'MATCH(user:User{id:{userId}}) SET user.photoUrl = {photoUrl} RETURN user';
        let result = await this.session.run(queryString, { userId: userId, photoUrl: photoUrl});
        if (!_.isEmpty(result.records)) {
            return new UserEntity(result.records[0].get('user'));
        } else {
            return false;
        }
    }

    async getCurrentUser(currentUserId){

        let queryString = `MATCH(user{id:{currentUserId}}) 
                           RETURN user`;
        let result = await this.session.run(queryString, { currentUserId: currentUserId });
        if (!_.isEmpty(result.records)) {
            return new UserEntity(result.records[0].get('user'), {hiddenFields: ['password']});
        } else {
            return false;
        }
    }

    async getUserFollowers(userId, currentUserId, offset, limit) {

        let followQueryString = '';
        let followReturnString = '';
        let paramObject = {};

        if (currentUserId) {
            followQueryString = ` OPTIONAL MATCH(currentUser:User{id:{currentUserId}})-[:FOLLOWS_USER]->(follower) 
                                      OPTIONAL MATCH(:User{id:{currentUserId}})<-[following:FOLLOWS_USER]-(follower) `;
            followReturnString = `, followed: count(currentUser) > 0, following: count(following) > 0`;
            paramObject = { currentUserId: currentUserId };
        }

        let queryString = `MATCH(user:User{id:{userId}}), (follower)-[:FOLLOWS_USER]->(user) 
                                ${followQueryString} 
                               RETURN follower{.* ${followReturnString}} SKIP ${offset} LIMIT ${limit}`;

        let result = await this.session.run(queryString, { userId: userId, ...paramObject });
        if (!_.isEmpty(result.records)) {

            let followers = result.records.map((result) => new UserEntity(result.get('follower')));
            return followers;
        } else {
            return [];
        }


    }

    async getUserFollowersCount(userId) {

        let queryString = `MATCH(user:User{id:{userId}}), (follower)-[:FOLLOWS_USER]->(user) RETURN count(follower) as count`;
        let result = await this.session.run(queryString, { userId: userId });
        return result.records[0].get('count').toNumber();

    }
    async getUserFollowing(userId, currentUserId, offset, limit) {

        let followQueryString = '';
        let followReturnString = '';
        let paramObject = {};

        if (currentUserId) {
            followQueryString = ` OPTIONAL MATCH(currentUser:User{id:{currentUserId}})-[:FOLLOWS_USER]->(follower) 
                                  OPTIONAL MATCH(:User{id:{currentUserId}})<-[following:FOLLOWS_USER]-(follower) `;
            followReturnString = `, followed: count(currentUser) > 0, following: count(following) > 0`;
            paramObject = { currentUserId: currentUserId };
        }

        let queryString = `MATCH(user:User{id:{userId}}), (user)-[:FOLLOWS_USER]->(followedUser) 
                           ${followQueryString} 
                           RETURN followedUser{.* ${followReturnString}} SKIP ${offset} LIMIT ${limit}`;

        let result = await this.session.run(queryString, { userId: userId, ...paramObject });
        if (!_.isEmpty(result.records)) {

            let followedUsers = result.records.map((result) => new UserEntity(result.get('followedUser')));
            return followedUsers;
        } else {
            return [];
        }


    }

    async getUserFollowingCount(userId) {

        let queryString = `MATCH(user:User{id:{userId}}), (follower)-[:FOLLOWS_USER]-(user) RETURN count(follower) as count`;
        let result = await this.session.run(queryString, { userId: userId });
        return result.records[0].get('count').toNumber();

    }

    async isUserFollowed(userId, currentUserId) {

        let queryString = `MATCH(user:User{id:{currentUserId}})-[:FOLLOWS_USER]->(followed:User{id:{userId}}) RETURN 1`;
        let result = await this.session.run(queryString, { userId: userId, currentUserId: currentUserId });

        if (_.isEmpty(result.records)) {
            return false;
        } else {
            return true;
        }

    }

    async followUser(userId, currentUserId) {

        let userFollowQueryString = `MATCH(currentUser:User{id:{currentUserId}}), (userToFollow:User{id:{userId}}) MERGE (currentUser)-[follows:FOLLOWS_USER]->(userToFollow) ON CREATE SET follows.dateAdded = apoc.date.format(timestamp())
            WITH 1 as followed
            MATCH(userFollowed:User{id:{userId}}) SET userFollowed.followerCount = userFollowed.followerCount + 1 RETURN 1`;

        let result = await this.session.run(userFollowQueryString, { userId: userId, currentUserId: currentUserId });

        if (_.isEmpty(result.records)) {
            return false;
        } else {
            return true;
        }

    }

    async unfollowUser(userId, currentUserId) {

        let userFollowQueryString = `MATCH(currentUser:User{id:{currentUserId}})-[follows:FOLLOWS_USER]->(followedUser:User{id:{userId}}) DELETE follows
            WITH 1 as unfollowed
            MATCH(userFollowed:User{id:{userId}}) SET userFollowed.followerCount = userFollowed.followerCount - 1 RETURN 1`;

        let result = await this.session.run(userFollowQueryString, { userId: userId, currentUserId: currentUserId });

        if (_.isEmpty(result.records)) {
            return false;
        } else {
            return true;
        }

    }

    async getUserJokes(offset, limit, currentUserId, userId) {

        let likeQueryString = (currentUserId) ? `OPTIONAL MATCH 
            (currentUserFav:User{id:{currentUserId}})-[:FAVORITED]->(joke) 
            OPTIONAL MATCH 
            (currentUserLike:User{id:{currentUserId}})-[:LIKES]->(joke) `: '';
        let likeReturnString = (currentUserId) ? 'favorited:count(currentUserFav) > 0, liked:count(currentUserLike) > 0,' : '';
        let paramObject = (currentUserId) ? { currentUserId: currentUserId } : {};

        paramObject = { ...paramObject, ...{ userId: userId } };

        let queryString = `MATCH(joke:Joke), 
                            (owner:User{id:{userId}})-[:ADDED]->(joke)-[:BELONGS_TO]->(movie:Movie)
                                ${likeQueryString}
                                RETURN joke{.*, ${likeReturnString}}, owner, movie SKIP ${offset} LIMIT ${limit}`;

        let result = await this.session.run(queryString, paramObject);
        if (!_.isEmpty(result.records)) {

            let jokes = result.records.map((result) => new JokeEntity(result.get('joke'),
                {
                    owner: new UserEntity(result.get('owner')),
                    movie: new MovieEntity(result.get('movie'))
                }));
            return jokes;
        } else {
            return [];
        }

    }

    async getUserJokesCount(userId) {

        let queryString = `MATCH(user:User{id:{userId}})-[:ADDED]->(jokes:Joke) RETURN count(jokes) as count`;
        let result = await this.session.run(queryString, { userId: userId });

        return result.records[0].get('count').toNumber();
    }

    async getFavoriteJokesCount(userId) {

        let queryString = `MATCH(user:User{id:{userId}})-[:FAVORITED]->(joke:Joke) RETURN count(joke) as count`;

        let result = await this.session.run(queryString, { userId: userId });
        return result.records[0].get('count').toNumber();
    }


    async getFavoriteJokes(userId, offset, limit) {

        let queryString = `MATCH(user:User{id:{userId}})-[fav:FAVORITED]->(joke:Joke) , (owner)-[:ADDED]->(joke)-[:BELONGS_TO]->(movie) 
            OPTIONAL MATCH 
                    (userLike:User{id:{userId}})-[:LIKES]->(joke)
            RETURN joke{.*, favorited:true, liked:count(userLike) > 0 }, owner, movie, fav ORDER BY fav.dateAdded DESC SKIP ${offset} LIMIT ${limit}`;


        let result = await this.session.run(queryString, { userId: userId });
        if (!_.isEmpty(result.records)) {

            let jokes = result.records.map((result) => new JokeEntity(result.get('joke'),
                {
                    owner: new UserEntity(result.get('owner')),
                    movie: new MovieEntity(result.get('movie'))
                }));
            return jokes;

        } else {
            return [];
        }
    }

    async addJokeToFavorite(userId, jokeId) {

        let queryString = `MATCH(user:User{id:{userId}}), (joke:Joke{id:{jokeId}}) MERGE (user)-[fav:FAVORITED]->(joke) ON CREATE SET fav.dateAdded = apoc.date.format(timestamp())  RETURN 1`;

        let result = await this.session.run(queryString, { userId: userId, jokeId: jokeId });
        if (!_.isEmpty(result.records)) {
            return true;
        } else {
            return false;
        }

    }

    async removeJokeFromFavorite(userId, jokeId) {

        let queryString = `MATCH(user:User{id:{userId}})-[r:FAVORITED]->(joke:Joke{id:{jokeId}}) DELETE r RETURN 1`;

        let result = await this.session.run(queryString, { userId: userId, jokeId: jokeId });
        if (!_.isEmpty(result.records)) {
            return true;
        } else {
            return false;
        }

    }



    async canLogin(credential, password) {

        let emailHelper = new EmailHelper();
        let user = '';
        let prop = {};
        if (emailHelper.isValidEmail(credential)) {
            prop = { email: credential };
        } else {
            prop = { username: credential };
        }
        user = await super.get({ prop: prop, takenFields: ['*'] });
        if (user) {
            let passwordHash = user.password;
            let passwordMatch = await bcrypt.compare(password, passwordHash);
            if (passwordMatch) {
                return user;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    async isEmailTaken(email) {
        let queryString = `MATCH(user:User{email:{email}}) RETURN 1`;
        let result = await this.session.run(queryString, {email: email});
        if (_.isEmpty(result.records)) {
            return false;
        } 
        return true;
    }

    async usernameTaken(username) {

        let queryString = `MATCH(user:User{username:{username}}) RETURN 1`;
        let result = await this.session.run(queryString, {username: username});
        if (_.isEmpty(result.records)) {
            return false;
        } 
        return true;
    }


    async changePassword(userId, newPassword) {
        const saltRounds = 10;
        let passwordHash = await bcrypt.hash(newPassword, saltRounds);


        let passwordChange = await super.update({ prop: { id: userId }, update: { password: passwordHash }, return: ['id'] });

        if (passwordChange) {
            return true;
        } else {
            return false;
        }

    }

    async getPasswordTokenOwner(tokenId) {

        let query = `MATCH(passwordToken:PasswordToken{tokenId:{tokenId}})-[:PASSWORD_TOKEN_FOR]->(user:User) 
                        RETURN user 
                        LIMIT 1`;

        let results = await this.session.run(query, { tokenId: tokenId });
        if (!_.isEmpty(results.records)) {
            return new UserEntity(results.records[0].get('user'));
        } else {
            return false;
        }

    }
}

module.exports = Users;