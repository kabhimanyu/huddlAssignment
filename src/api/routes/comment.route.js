const express = require('express');
const controller = require('@controllers/comment.controller');
const { authorize } = require('@middlewares/auth');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */
router.param('commentId', controller.load);


router
   .route('/')
   /**
    * @api {get} v1/comment List Comments
    * @apiDescription Get a list of comment
    * @apiVersion 1.0.0
    * @apiName ListComments
    * @apiGroup Comment
    * @apiPermission admin
    *
    * @apiHeader {String} Authorization   User's access token
    *
    * @apiParam  {Number{1-}}         [page=1]     List page
    * @apiParam  {Number{1-100}}      [perPage=1]  Comments per page
    *
    * @apiSuccess {Object[]} List of comment.
    *
    * @apiError (Unauthorized 401)  Unauthorized  Only authenticated comment can access the data
    */
   .get(authorize(), controller.list)
   /**
    * @api {post} v1/comment Create Comment
    * @apiDescription Create a new comment
    * @apiVersion 1.0.0
    * @apiName CreateComment
    * @apiGroup Comment
    * @apiPermission admin
    *
    * @apiHeader {String} Authorization   User's access token
    *
    * @apiParam  {String}      text        Comment's text
    * @apiParam  {String}      [parent]    Comment's parent
    * @apiParam  {String}      wall        Comment's wall
    *
    * @apiSuccess  {String}  id         Comment's id
    * @apiSuccess  {String}  wall       Comment's wall
    * @apiSuccess  {String}  author     Comment's author
    * @apiSuccess  {String}  text       Comment's text
    * @apiSuccess  {String}  text     Comment's parent
    * @apiSuccess  {Date}    createdAt  Timestamp
    *
    * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
    * @apiError (Unauthorized 401)  Unauthorized     Only authenticated comment can create the data
    */
   .post(authorize(), controller.create);


router
   .route('/:commentId')
   /**
    * @api {get} v1/comment/:id Get Comment
    * @apiDescription Get comment information
    * @apiVersion 1.0.0
    * @apiName GetComment
    * @apiGroup Comment
    *
    * @apiHeader {String} Authorization   User's access token
    *
    * @apiSuccess  {String}  id         Comment's id
    * @apiSuccess  {String}  wall       Comment's wall
    * @apiSuccess  {String}  author     Comment's author
    * @apiSuccess  {String}  text       Comment's text
    * @apiSuccess  {String}  text     Comment's parent
    * @apiSuccess  {Date}    createdAt  Timestamp
    *
    * @apiError (Unauthorized 401) Unauthorized Only authenticated user can access the data
    * @apiError (Not Found 404)    NotFound     Comment does not exist
    */
   .get(authorize(), controller.get)

   /**
    * @api {patch} v1/comment/:id Update Comment
    * @apiDescription Update some fields of a user document
    * @apiVersion 1.0.0
    * @apiName UpdateComment
    * @apiGroup Comment
    * @apiPermission user
    *
    * @apiHeader {String} Authorization   User's access token
    *
    * @apiParam  {String}  text       Comment's text
    *
    * @apiSuccess  {String}  id         Comment's id
    * @apiSuccess  {String}  wall       Comment's wall
    * @apiSuccess  {String}  author     Comment's author
    * @apiSuccess  {String}  text       Comment's text
    * @apiSuccess  {String}  text     Comment's parent
    * @apiSuccess  {Date}    createdAt  Timestamp
    *
    * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
    * @apiError (Unauthorized 401) Unauthorized Only authenticated comment can modify the data
    * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
    * @apiError (Not Found 404)    NotFound     Comment does not exist
    */
   .patch(authorize(), controller.update)
   /**
    * @api {patch} v1/comment/:id Delete Comment
    * @apiDescription Delete a user
    * @apiVersion 1.0.0
    * @apiName DeleteComment
    * @apiGroup Comment
    * @apiPermission user
    *
    * @apiHeader {String} Authorization   User's access token
    *
    * @apiSuccess (No Content 204)  Successfully deleted
    *
    * @apiError (Unauthorized 401) Unauthorized  Only authenticated comment can delete the data
    * @apiError (Forbidden 403)    Forbidden     Only user with same id can delete the data
    * @apiError (Not Found 404)    NotFound      Comment does not exist
    */
   .delete(authorize(), controller.remove);

router
   .route('/:commentId/reply')
   /**
    * @api {get} v1/comment/:id/reply Reply to a Comment
    * @apiDescription Reply to a comment 
    * @apiVersion 1.0.0
    * @apiName ReplyComment
    * @apiGroup Comment
    *
    * @apiHeader {String} Authorization   User's access token
    *
    * @apiParam  {String}      text        Comment's text
    * @apiParam  {String}      [parent]    Comment's parent
    * @apiParam  {String}      wall        Comment's wall
    * 
    * @apiSuccess  {String}  id         Comment's id
    * @apiSuccess  {String}  wall       Comment's wall
    * @apiSuccess  {String}  author     Comment's author
    * @apiSuccess  {String}  text       Comment's text
    * @apiSuccess  {String}  parent       Comment's parent
    * @apiSuccess  {Date}    createdAt  Timestamp
    *
    * @apiError (Unauthorized 401) Unauthorized Only authenticated user can access the data
    * @apiError (Not Found 404)    NotFound     Comment does not exist
    */
   .post(authorize(), controller.reply)


module.exports = router;
