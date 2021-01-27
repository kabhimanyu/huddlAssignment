const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const sinon = require('sinon');
const { some, omitBy, isNil } = require('lodash');
const app = require('../../../../index');
const User = require('../../models/user.model');
const Comment = require('../../models/comment.model');


describe('Comments API', async () => {
   let userAccessToken;
   let user2AccessToken;
   let commentBody;
   let comment;

   const password = 'pass1234';

   beforeEach(async () => {
      dbUsers = {
         yoda: {
            email: 'yoda@gmail.com',
            password: password,
            firstName: 'yoda',
            lastName: 'yoda',
         },
         darth: {
            email: 'darth@gmail.com',
            password: password,
            firstName: 'darth',
            lastName: 'vader',
         }
      };

      commentBody = {
         text: 'Yoda Speaks the truth'
      };
      await User.deleteMany({});
      await Comment.deleteMany({})
      await User.create(dbUsers.yoda);
      await User.create(dbUsers.darth);

      let { accessToken, user } = await User.findAndGenerateToken(dbUsers.yoda);
      userAccessToken = accessToken
      comment = {
         text: 'Yoda Speaks the truth',
         wall: user._id,
         author: user._id,
         reactions: {
            "+1": 0,
            "like": 0,
            "dislike": 0
         },
      }
      accessToken = (await User.findAndGenerateToken(dbUsers.yoda)).accessToken;
      user2AccessToken = accessToken;
      await Comment.create({
         text: 'Temp comment',
         wall: user._id,
         author: user._id,
         reactions: {
            "+1": 0,
            "like": 0,
            "dislike": 0
         }
      })
   });

   describe('POST /v1/comments', () => {
      it('should create a new comment when request is ok', () => {
         return request(app)
            .post('/v1/comment')
            .set('Authorization', `Bearer ${userAccessToken}`)
            .send(commentBody)
            .expect(httpStatus.CREATED)
            .then((res) => {
               expect(res.body).to.include(commentBody);
            });
      });
      it('should not allow null string as comments', () => {
         commentBody.text = undefined;
         return request(app)
            .post('/v1/comment')
            .set('Authorization', `Bearer ${userAccessToken}`)
            .send(commentBody)
            .expect(httpStatus.BAD_REQUEST)
            .then((res) => {
               const { message, code } = res.body;
               expect(code).to.be.equal(400);
               expect(message).to.include('Comment cannot be empty');
            });
      });
      it('should allow user to comment on his/her own comment', async () => {
         let userComment = await Comment.findOne({});
         return request(app)
            .post(`/v1/comment/${userComment._id}/reply`)
            .set('Authorization', `Bearer ${userAccessToken}`)
            .send(commentBody)
            .expect(httpStatus.CREATED)
            .then((res) => {
               expect(res.body).to.include(commentBody);
            });
      });
      it('should allow user to comment on other users comment', async () => {
         let userComment = await Comment.findOne({});
         return request(app)
            .post(`/v1/comment/${userComment._id}/reply`)
            .set('Authorization', `Bearer ${user2AccessToken}`)
            .send(commentBody)
            .expect(httpStatus.CREATED)
            .then((res) => {
               expect(res.body).to.include(commentBody);
            });
      });
      it('should allow user to react on thier own comment', async () => {
         let userComment = await Comment.findOne({});
         return request(app)
            .post(`/v1/comment/${userComment._id}/reaction`)
            .set('Authorization', `Bearer ${userAccessToken}`)
            .send({
               "reaction": "like"
            })
            .expect(httpStatus.OK)
            .then((res) => {
               expect(res.body.message).to.include('Reaction saved');
            });
      });
      it('should allow user to react on other users comment', async () => {
         let userComment = await Comment.findOne({});
         return request(app)
            .post(`/v1/comment/${userComment._id}/reaction`)
            .set('Authorization', `Bearer ${user2AccessToken}`)
            .send({
               "reaction": "like"
            })
            .expect(httpStatus.OK)
            .then((res) => {
               expect(res.body.message).to.include('Reaction saved');
            });
      });
   });
});