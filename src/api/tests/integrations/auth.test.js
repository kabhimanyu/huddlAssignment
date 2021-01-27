const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('../../../../index');
const User = require('../../models/user.model');

const sandbox = sinon.createSandbox();

describe('Authentication API', () => {
   let dbUser;
   let user;

   beforeEach(async () => {
      dbUser = {
         email: 'test@gmail.com',
         password: 'pass1234',
         firstName: 'testDb',
         lastName: 'User'
      };

      user = {
         email: 'yoda@gmail.com',
         password: 'pass1234',
         firstName: 'yoda',
         lastName: 'yoda'
      };

      await User.deleteMany({});
      await User.create(dbUser);
   });

   afterEach(() => sandbox.restore());

   describe('POST /v1/auth/register', () => {
      it('should register a new user when request is ok', () => {
         return request(app)
            .post('/v1/auth/register')
            .send(user)
            .expect(httpStatus.CREATED)
            .then((res) => {
               delete user.password;
               expect(res.body.token).to.have.a.property('accessToken');
               expect(res.body.token).to.have.a.property('expiresIn');
               expect(res.body.user).to.include(user);
            })
      });

      it('should report error when email already exists', () => {
         return request(app)
            .post('/v1/auth/register')
            .send(dbUser)
            .expect(httpStatus.CONFLICT)
            .then((res) => {
               const { field } = res.body.errors[0];
               const { location } = res.body.errors[0];
               const { messages } = res.body.errors[0];
               expect(field).to.be.equal('email');
               expect(location).to.be.equal('body');
               expect(messages).to.include('"email" already exists');
            });
      });

      it('should report error when the email provided is not valid', () => {
         user.email = 'invalidEmail';
         return request(app)
            .post('/v1/auth/register')
            .send(user)
            .expect(httpStatus.INTERNAL_SERVER_ERROR)
            .then((res) => {
               const { message, code } = res.body;
               expect(code).to.be.equal(500);
               expect(message).to.include(`User validation failed: email`);
            });
      });

      it('should report error when email and password are not provided', () => {
         return request(app)
            .post('/v1/auth/register')
            .send({})
            .expect(httpStatus.INTERNAL_SERVER_ERROR)
            .then((res) => {
               const { message, code } = res.body;
               expect(code).to.be.equal(500);
               expect(message).to.include('User validation failed');
            });
      });

   });

   describe('POST /v1/auth/login', () => {
      it('should return an accessToken when email and password matches', () => {
         return request(app)
            .post('/v1/auth/login')
            .send(dbUser)
            .expect(httpStatus.OK)
            .then((res) => {
               delete dbUser.password;
               expect(res.body.token).to.have.a.property('accessToken');
               expect(res.body.token).to.have.a.property('expiresIn');
               expect(res.body.user).to.include(dbUser);
            });
      });
      it('should report error when email and password are not provided', () => {
         return request(app)
            .post('/v1/auth/login')
            .send({})
            .expect(httpStatus.INTERNAL_SERVER_ERROR)
            .then((res) => {
               const { message, code } = res.body;
               expect(code).to.be.equal(500);
               expect(message).to.include(`An email is required to generate a token`);
            });
      });

      it('should report error when the email provided is not valid', () => {
         user.email = 'this_is_not_an_email';
         return request(app)
            .post('/v1/auth/login')
            .send(user)
            .expect(httpStatus.UNAUTHORIZED)
            .then((res) => {
               const { message, code } = res.body;
               expect(code).to.be.equal(401);
               expect(message).to.include(`Incorrect email or password`);
            });
      });
      it("should report error when email and password don't match", () => {
         dbUser.password = 'xxx';
         return request(app)
            .post('/v1/auth/login')
            .send(dbUser)
            .expect(httpStatus.UNAUTHORIZED)
            .then((res) => {
               const { message, code } = res.body;
               expect(code).to.be.equal(401);
               expect(message).to.include(`Incorrect email or password`);
            });
      });
   });
})

