var nconf = require('../../config/config');
var neo4j = require('neo4j-driver').v1;
const bcrypt = require('bcrypt');

const PasswordTokens = require('./../../app/models/password_tokens');

class TestDatabaseCreator{

        constructor(){
                
                this.driver = neo4j.driver(nconf.get('neo4j-local'), 
                                                neo4j.auth.basic(nconf.get('neo4j-username'), 
                                                nconf.get('neo4j-password')));
                
                this.session =  this.driver.session();

                this.users = [
                        {id: '0a6a257d-d2fb-46fc-a85e-0295c986cd9a', username:'mary', email:'mary@email.com'},
                        {id: '1a6a257d-d2fb-46fc-a85e-0295c986cd9a', username:'john', email:'john@email.com'},
                        {id: '2a6a257d-d2fb-46fc-a85e-0295c986cd9a', username:'ada', email:'ada@email.com'},
                        {id: '3a6a257d-d2fb-46fc-a85e-0295c986cd9a', username:'ama', email:'ama@email.com'},
                        {id: '4a6a257d-d2fb-46fc-a85e-0295c986cd9a', username:'jack', email:'jack@email.com'},
                        {id: '5a6a257d-d2fb-46fc-a85e-0295c986cd9a', username:'jill', email:'jill@email.com'},
                        {id: '6a6a257d-d2fb-46fc-a85e-0295c986cd9a', username:'steph', email:'steph@email.com'}
                ]
            

        }
    
        async createDefaultMockDb(){   

                let queryString = 'CREATE (user:User{props})';
                let count = 0;
                // users.forEach(async (user)=>{
                //         const saltRounds = 10;
                //         let passwordHash = await bcrypt.hash(user.username, saltRounds);
                //         user.password = passwordHash;

                //         let prop = {};
                //         prop.props = user;
                //         let result = await this.session.run(queryString, prop);
                //         console.log('in each');
                //         count ++;
                // });

                for(let i = 0 ; i < this.users.length ; i++ ){
                        const saltRounds = 10;
                        let passwordHash = await bcrypt.hash(this.users[i].username, saltRounds);
                        this.users[i].password = passwordHash;

                        let prop = {};
                        prop.props = this.users[i];
                        let result = await this.session.run(queryString, prop);

                }
                console.log('db created...');               
        }

        async clearDatabase(){
                let queryString  = 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r RETURN count(n) as count';
                let results = await this.session.run(queryString);
        }


        async createForgotTokenForUser(index, expired = false){

               let passwordTokens = new PasswordTokens(this.session);
               let tokenId = await passwordTokens.createToken(this.users[index].email);

               if(expired){
                        await passwordTokens.update({prop:{tokenId:tokenId}, update:{dateExpires:'2018-09-20 03:18:06'}});
               }
               return tokenId;
        }

        closeSession(){
                this.session.close();
        }

}

module.exports = TestDatabaseCreator;