var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('./../../../../../app'); 
var expect = chai.expect;
const JwtHelper = require('../../../../../app/helpers/jwt_helper');
const DatabaseCreator = require('./../../../../mocks/test_database_creator');

const v1 = '/api/v1';
chai.use(chaiHttp);

describe('/users/:id/password', function(){

    let jwtHelper = new JwtHelper();
    let dbCreator = new DatabaseCreator();
    let testUser = dbCreator.users[0];
    let anotherValidUser = dbCreator.users[1];
    let testUserToken = jwtHelper.generateJwtToken({id:testUser.id,username:testUser.username, email: testUser.email});
    let anotherUserToken = jwtHelper.generateJwtToken({id: anotherValidUser.id, username: anotherValidUser.username, email: anotherValidUser.email});

    before(async ()=>{
        await dbCreator.clearDatabase();
        await dbCreator.createDefaultMockDb();
     });

    describe('PATCH', function(){

        it('Should not work if not authenticated', ()=>{

                //TODO: remove all these catch blocks if they add no meaning to th test
            return chai.request(app)
            .patch(`${v1}/users/${testUser.id}/password`)
            .set('Content-Type','application/json')
            .set('Authorization','jwt '+'wsddeeerrawdffrr') //wrong token
            .then((response)=>{
                expect(response).to.have.status(401);
            }).catch((error)=>{
                    throw error;
            });

        });

        it('Should not work if authenticated user is not account owner', ()=>{
            
            return chai.request(app)
            .patch(`${v1}/users/${testUser.id}/password`)
            .set('Content-Type','application/json')
            .set('Authorization','jwt '+anotherUserToken)
            .send({
                    oldPassword: testUser.username,
                    newPassword: 'newPassword####1'
            }) //wrong token
            .then((response)=>{
                expect(response).to.have.status(403);
            }).catch((error)=>{
                    throw error;
            });

        });
        it('Should not work if password does not meet criteria', ()=>{
            return chai.request(app)
            .patch(`${v1}/users/${testUser.id}/password`)
            .set('Content-Type','application/json')
            .set('Authorization','jwt '+testUserToken)
            .send({
                    oldPassword: testUser.username,
                    newPassword: 'newpass'
            }) //wrong token
            .then((response)=>{
                expect(response).to.have.status(422);
            }).catch((error)=>{
                    throw error;
            });

        });
        it('Should not work if old password is not same as submitted old password', ()=>{

            return chai.request(app)
            .patch(`${v1}/users/${testUser.id}/password`)
            .set('Content-Type','application/json')
            .set('Authorization','jwt '+testUserToken)
            .send({
                    oldPassword: 'wrongPassword111',
                    newPassword: 'newPassword####1'
            }) //wrong token
            .then((response)=>{
                expect(response).to.have.status(403);
            }).catch((error)=>{
                    throw error;
            });

        });

        it('Should successfully change user password', ()=>{
            return chai.request(app)
            .patch(`${v1}/users/${testUser.id}/password`)
            .set('Content-Type','application/json')
            .set('Authorization','jwt '+testUserToken)
            .send({
                    oldPassword: testUser.username, // the username is the same as the valid password
                    newPassword: 'newPassword####1'
            }) //wrong token
            .then((response)=>{
                expect(response).to.have.status(204);
            }).catch((error)=>{
                    throw error;
            });

        });



    });
});