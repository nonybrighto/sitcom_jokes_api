var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('./../../../../app'); 
var expect = chai.expect;
const JwtHelper = require('../../../../app/helpers/jwt_helper');
const DatabaseCreator = require('./../../../mocks/test_database_creator');

const v1 = '/api/v1';
chai.use(chaiHttp);

describe('/users/password', function(){

    let jwtHelper = new JwtHelper();
    let dbCreator = new DatabaseCreator();
    let testUser = dbCreator.users[1];
    let userToHaveValidToken = dbCreator.users[0];
    var validToken = '';
    var expiredToken = '';

    before(async ()=>{
        await dbCreator.clearDatabase();
        await dbCreator.createDefaultMockDb();
        this.validToken = await dbCreator.createForgotTokenForUser(0); //0th user
        this.expiredToken = await dbCreator.createForgotTokenForUser(3, true);
    });

    describe('POST', ()=>{

        it('Should fail if email is invalid', ()=>{

                //TODO: remove all these catch blocks if they add no meaning to th test
            return chai.request(app)
            .post(`${v1}/users/password`)
            .set('Content-Type','application/json')
            .send({
                email: 'peter'
            })
            .then((response)=>{
                expect(response).to.have.status(422);
            }).catch((error)=>{
                    throw error;
            });

        });

        it('Should fail if email is not registered', ()=>{

            //TODO: remove all these catch blocks if they add no meaning to th test
            return chai.request(app)
            .post(`${v1}/users/password`)
            .set('Content-Type','application/json')
            .send({
                email: 'unregisteredemail@email.com'
            })
            .then((response)=>{
                expect(response).to.have.status(404);
            }).catch((error)=>{
                    throw error;
            });

         });
        it('Should successfully send email to email specified', ()=>{
            return chai.request(app)
            .post(`${v1}/users/password`)
            .set('Content-Type','application/json')
            .send({
                    email: testUser.email
            }) //wrong token
            .then((response)=>{
                expect(response).to.have.status(202);
            }).catch((error)=>{
                    throw error;
            });

        });
    });


    describe('PUT', ()=>{

        it('Should fail to send for invalid token and new password pattern', ()=>{
            return chai.request(app)
            .put(`${v1}/users/password`)
            .set('Content-Type','application/json')
            .send({
                    token: 'ww',
                    newPassword: 'newpass'
            }) //wrong token
            .then((response)=>{
                expect(response).to.have.status(422);
                expect(response.body.errors.length).to.equal(2)
            }).catch((error)=>{
                    throw error;
            });

        });

         it('should fail if token does not exist', ()=>{
            return chai.request(app)
            .put(`${v1}/users/password`)
            .set('Content-Type','application/json')
            .send({
                    token: '123456789',
                    newPassword: 'newpass####11'
            }) //wrong token
            .then((response)=>{
                expect(response).to.have.status(404);
            }).catch((error)=>{
                    throw error;
            });

        });

        it('should fail if token is expired', ()=>{
            return chai.request(app)
            .put(`${v1}/users/password`)
            .set('Content-Type','application/json')
            .send({
                    token: this.expiredToken,
                    newPassword: 'newpass####11'
            }) //wrong token
            .then((response)=>{
                expect(response).to.have.status(404);
            }).catch((error)=>{
                    throw error;
            });

        });

        it('should successfully change password and return new jwt token and user', ()=>{
            return chai.request(app)
            .put(`${v1}/users/password`)
            .set('Content-Type','application/json')
            .send({
                    token: this.validToken,
                    newPassword: 'newpass####1234'
            }) //wrong token
            .then((response)=>{
                expect(response).to.have.status(200);
                expect(response.body).to.haveOwnProperty('token'),
                expect(response.body).to.haveOwnProperty('user')
            }).catch((error)=>{
                    throw error;
            });

        });

    });
});