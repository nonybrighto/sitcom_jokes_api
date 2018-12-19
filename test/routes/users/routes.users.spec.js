var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('./../../../app'); 
var expect = chai.expect;
const JwtHelper = require('../../../app/helpers/jwt_helper');
const DatabaseCreator = require('./../../mocks/test_database_creator');



var v1 = '/api/v1';
chai.use(chaiHttp);

describe('/users', function(){
    let jwtHelper = new JwtHelper();
    let dbCreator = new DatabaseCreator();
    let testUser = dbCreator.users[0];
    let token = jwtHelper.generateJwtToken({id: testUser.id,username: testUser.username, email: testUser.email});

    //console.log('value is '+dbCreator);
   
    before(async ()=>{

      
       await dbCreator.clearDatabase();
       await dbCreator.createDefaultMockDb();

       console.log('hello-----');

    });

    describe('GET', function(){

        it('should fail when wrong credentials or no credential sent', ()=>{

            return chai.request(app)
            .get('/api/v1/users')
            .set('Content-Type','application/json')
            .set('Authorization','jwt '+'wsddeeerrawdffrr') //wrong token
            .then((response)=>{
                expect(response).to.have.status(401);
            }).catch((error)=>{
                    throw error;
            });
        });

        it('should get list of users', ()=>{
            console.log('getting user list');
            return chai.request(app)
            .get('/api/v1/users')
            .set('Content-Type','application/json')
            .set('Authorization','jwt '+token)
            .then((response)=>{
                expect(response).to.have.status(200);
                expect(response).to.be.json;
                expect(response.body).to.be.an('array');
                expect(response.body.length).to.be.greaterThan(6);
                expect(response.body[0]).to.have.property('username');
                expect(response.body[0]).to.have.property('id');
            });
           
        });

        //TODO: make this test pass and prevent sending sensitive content to the client
        // it('should not send sensitive data in output', ()=>{
        //      return chai.request(app)
        //      .get('/api/v1/users')
        //      .set('Content-Type','application/json')
        //      .set('Authorization','jwt '+token)
        //      .then((response)=>{
        //          expect(response).to.have.status(200);
        //          expect(response).to.be.json;
        //          expect(response.body[0]).to.not.have.property('password');
        //      });

        // });

    });


    describe('POST', function(){


        it('should fail when invalid content is sent in request', ()=>{

            return chai.request(app)
            .post('/api/v1/users')
            .set('Content-Type','application/json')
            .send({
                username: '', //empty and less than required
                email: 'amara', // wrong email form
                password: 'amara' // does not meet the minimum password requirement
            })
            .then((response)=>{
                expect(response).to.have.status(422);
                expect(response.body).to.have.property('message');
                expect(response.body.errors.length).to.equal(3);
            });
        });

        it('should fail when existing username is used', ()=>{
            return chai.request(app)
            .post('/api/v1/users')
            .set('Content-Type','application/json')
            .send({
                username: 'mary',
                email: 'amara@gmail.com',
                password: 'amara12345###1'
            })
            .then((response)=>{
                expect(response).to.have.status(409);
            }).catch((error)=>{
                    throw error;
            });
        });

        it('should fail when existing email is used', ()=>{
            return chai.request(app)
            .post('/api/v1/users')
            .set('Content-Type','application/json')
            .send({
                username: 'Amara',
                email: 'mary@email.com', // wrong email form
                password: 'amara12345###'
            })
            .then((response)=>{
                expect(response).to.have.status(409);
            }).catch((error)=>{
                    throw error;
            });
        });
       
        it('should save new user when vaild and return newly created user', ()=>{

            return chai.request(app)
            .post('/api/v1/users')
            .set('Content-Type','application/json')
            .send({
                username: 'Amara',
                email: 'amara@gmail.com', // wrong email form
                password: 'amara12345#1' // does not meet the minimum password requirement
            })
            .then((response)=>{
                expect(response).to.have.status(201);
            });
        });


    });

});