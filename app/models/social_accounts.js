const _ = require('lodash');
const Model = require('./model');
const SocialAccountEntity = require('./neo4j/social_account_entity');


class SocialAccount extends Model{

        constructor(session, accountType){
            super(SocialAccountEntity, session);
            this.labels = ['SocialAccount'];
            this.accountType = accountType;
            this.loginType = this._getLoginType(accountType);
            this.subAccountType = this._getSubAccountType(accountType);
        }

        async addAccount(accountId, ownerEmail){
                let queryString = `MATCH(user:User{email:{ownerEmail}}) 
                                   CREATE  
                                   (user)-[rel:${this.loginType}{dateAdded:apoc.date.format(timestamp()), 
                                    lastUsed: apoc.date.format(timestamp()), loginCount: 1}]->(:SocialAccount:${this.subAccountType}{accountId:{id}})`;
                await this.session.run(queryString, {ownerEmail:ownerEmail,id:accountId});

        }

        async updateUse(accountId, ownerEmail){
            
            let queryString = `MATCH(user:User{email:{ownerEmail}})-[rel:${this.loginType}]->(account:SocialAccount{accountId:{id}})
                               SET rel.lastUsed = apoc.date.format(timestamp()) , rel.loginCount = rel.loginCount + 1`;

            await this.session.run(queryString, {ownerEmail:ownerEmail,id:accountId});

            //update last used now , dloginCount
        }

        async accountExists(accountId){
            let account = await super.get({prop:{accountId:accountId}});
            if(account){
                return true;
            }
            return false;
        }

        _getLoginType(accountType){
           
            let loginType = '';
            switch(accountType){
                case 'facebook':
                    loginType = 'LOGGED_WITH_FACEBOOK';
                    break;
                case 'google':
                    loginType = 'LOGGED_WITH_GOOGLE';
                    break;
                default:
                    loginType = '';
            }

            return loginType;
        }

        _getSubAccountType(accountType){
            let subAccountType = '';
            switch(accountType){
                case 'facebook':
                    subAccountType = 'Facebook';
                    break;
                case 'google':
                    subAccountType = 'Google';
                    break;
                default:
                    subAccountType = '';
            }

            return subAccountType;
        }
}

module.exports = SocialAccount;