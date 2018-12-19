const chai = require('chai');
const expect = chai.expect;
const Joi = require('joi');

const userValidator = require('../app/middlewares/validators/user_validator');

describe('User registration credential check',function(){

    it('Should fail when fields are empty ', function(){

        const result = Joi.validate({username:"", email:"", password:""}, userValidator.createUser.body);
        expect(result.error).to.not.equal(null);
    });
    it('Should fail when username empty ', function(){
        const result = Joi.validate({username:"", email:"john@gmail.com", password:"123456asdf"}, userValidator.createUser.body);
        expect(result.error).to.not.equal(null);
    });
    it('Should fail when email empty ', function(){
        const result = Joi.validate({username:"john", email:"", password:"123456asdf"}, userValidator.createUser.body);
        expect(result.error).to.not.equal(null);
    });
    it('Should fail when password empty ', function(){
        const result = Joi.validate({username:"john", email:"john@gmail.com", password:""}, userValidator.createUser.body);
        expect(result.error).to.not.equal(null);
    });
    it('Should fail when email is invalid ', function(){
        const result = Joi.validate({username:"john", email:"www.gmail.com", password:"123456asdf"}, userValidator.createUser.body);
        expect(result.error).to.not.equal(null);
    });
    it('Should fail when password not contain numbers and letters or letters with different case and less than 6 characters ', function(){
        const result = Joi.validate({username:"john", email:"john@gmail.com", password:"1235675677"}, userValidator.createUser.body);
        expect(result.error).to.not.equal(null);
        const result2 = Joi.validate({username:"john", email:"john@gmail.com", password:"abcdefgh"}, userValidator.createUser.body);
        expect(result2.error).to.not.equal(null);
        const result3 = Joi.validate({username:"john", email:"john@gmail.com", password:"abd12"}, userValidator.createUser.body);
        expect(result3.error).to.not.equal(null);
    });
    it('Should fail when username is less than three characters', function(){
        const result = Joi.validate({username:"an", email:"john@gmail.com", password:"123456asdf"}, userValidator.createUser.body);
        expect(result.error).to.not.equal(null);
    });
    it('Should pass when all details are valid', function(){
        const result = Joi.validate({username:"john", email:"john@gmail.com", password:"123456asdf"}, userValidator.createUser.body);
        expect(result.error).to.equal(null);
    });

});