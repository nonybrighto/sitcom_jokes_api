var _ = require('lodash');
const bcrypt = require('bcrypt');
const Model = require('./model');
const UserEntity = require('./neo4j/user_entity');


class Users extends Model{

        constructor(session){
            super(UserEntity, session);
            this.labels = ['User'];
            this.uuidProp = 'username';
        }

        async addUser(username, email, password) {
            
            const saltRounds = 10;
            let passwordHash = await bcrypt.hash(password, saltRounds)
           return await super.add({prop:{username:username, email:email, password:passwordHash}});

        }

        async getAllUsers(){

            let allUsers = await super.getAll();
            return allUsers;
        }

        async canLogin(credential, password){

            //TODO:allow both username and email login
            let user = await super.get({prop:{username:credential}})
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