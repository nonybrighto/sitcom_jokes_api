const _ = require('lodash');
const Model = require('./model');
const PasswordTokenEntity = require('./neo4j/password_token_entity');
const nconf = require('./../../config/config');


class PasswordTokens extends Model{

    constructor(session){
        super(PasswordTokenEntity, session);
        this.labels = ['PasswordToken'];
    }

    async deleteToken(tokenId){

        let query = `MATCH (passwordToken:PasswordToken{tokenId:{tokenId}})-[r:PASSWORD_TOKEN_FOR]->(:User) 
                     DELETE passwordToken, r 
                     RETURN count(passwordToken) as count`;
        
        let result = await this.session.run(query, {tokenId:generatedTokenId, email:email});
        //TODO: inspect result
        if (!_.isEmpty(result.records) && result.records[0].get('count') > 0){
            return true;
        }else{
            return false;
        }

    }
    
    async createToken(email){

        let tokenExpirationLength = this._getTokenExpirationLength();
        
        let query = `MATCH (tokenOwner:User{email:{email}}) 
                    CREATE(passwordToken:PasswordToken{tokenId: {tokenId} , dateAdded:  apoc.date.format(timestamp()), 
                            dateExpires: apoc.date.format(timestamp() + ${tokenExpirationLength})}),
                    (passwordToken)-[:PASSWORD_TOKEN_FOR]->(tokenOwner) 
                    RETURN passwordToken`;
        
        let  generatedTokenId  = Math.random().toString(36).slice(-8);
        let result = await this.session.run(query, {tokenId:generatedTokenId, email:email});
        if(!_.isEmpty(result.records)){
            let passwordTokenEntity = new PasswordTokenEntity(result.records[0].get('passwordToken'));
            return passwordTokenEntity.tokenId;
        }
        return false;
    }

    async hasTokenForEmail(email){

        let query = `MATCH(passwordToken:PasswordToken)-[:PASSWORD_TOKEN_FOR]->(:User{email:{email}}) 
                    RETURN passwordToken 
                    LIMIT 1`;
        let result = await this.session.run(query, {email:email});

        if(!_.isEmpty(result.records)){
                return new PasswordTokenEntity({node:result.records[0].get('passwordToken')});
        }else{
            return false;
        }

    }

    async isValidToken(tokenId){
        let tokenExpirationLength = this._getTokenExpirationLength();
        let queryString = `MATCH(passwordToken:PasswordToken{tokenId:{tokenId}}) WHERE passwordToken.dateExpires > apoc.date.format(timestamp() - ${tokenExpirationLength}) RETURN passwordToken`;
        let result = await this.session.run(queryString, {tokenId: tokenId});

        if(!_.isEmpty(result.records)){
                return true;
        }else{
            return false;
        }
    }


    _getTokenExpirationLength(){
        return nconf.get('password-token-expire-hrs') * 60 * 60 * 1000;
    }

    // async confirmToken(email, tokenId){

    //     let query = "MATCH (token:PasswordToken{tokenId:{tokenId} ) , (tokenOwner:User{email:{email}}) , (password)-[:PASSWORD_TOKEN_FOR]->(tokenOwner) RETURN token ";
    //     result = await this.session.run(query, {tokenId:tokenId, email:email});
    //     if(_.isEmpty(result.records)){
    //         return false;
    //     }else{
    //         return true;
    //     }
    // }

}

module.exports = PasswordTokens;