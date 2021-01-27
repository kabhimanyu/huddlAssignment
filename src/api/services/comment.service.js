const Comment = require('@models/comment.model');
const httpStatus = require('http-status');
const APIError = require('@utils/APIError');

exports.validateCanDelete = async (req, res, next) => {
   try {
      const { user } = req;
      const { comment } = req.locals;
      if (comment.author && comment.author.id == user._id) {
         // author
         next();
      } else {
         return next(new APIError({
            message: 'Forbidden, You cannot delete commments added by other users',
            status: httpStatus.FORBIDDEN,
         }))
      }
   } catch (error) {
      next(new APIError(error));
   }
}

exports.deleteChildComments = async (req, res, next) => {
   try {
      const { comment } = req.locals;
      if (!comment.parent) {
         await Comment.deleteMany({ parent: comment._id });
      }
      return next()
   } catch (error) {
      next(new APIError(error));
   }
}

exports.updateReactionCount = async (req, res, next) => {
   try {
      const { reaction } = req.locals;
      const { commentId } = req.params;
      let options = {};
      if (reaction.oldReaction) {
         if (reaction.oldReaction == "+1") {
            options = { "$inc": { "reactions.+1": -1 } }
         } else if (reaction.oldReaction == "like") {
            options = { "$inc": { "reactions.like": -1 } }
         } else if (reaction.oldReaction == "dislike") {
            options = { "$inc": { "reactions.dislike": -1 } }
         } else {
            return next(new APIError({
               message: 'Invalid Reaction',
               status: httpStatus.BAD_REQUEST
            }))
         }
         await Comment.updateOne({ _id: commentId }, options)
      }
      if (reaction.reaction) {
         if (reaction.reaction && reaction.reaction == "+1") {
            options = { "$inc": { "reactions.+1": +1 } }
         } else if (reaction.reaction && reaction.reaction == "like") {
            options = { "$inc": { "reactions.like": +1 } }
         } else if (reaction.reaction && reaction.reaction == "dislike") {
            options = { "$inc": { "reactions.dislike": +1 } }
         } else {
            return next(new APIError({
               message: 'Invalid Reaction',
               status: httpStatus.BAD_REQUEST
            }))
         }
         await Comment.updateOne({ _id: commentId }, options)
      }

      return next();
   } catch (error) {
      next(new APIError(error));
   }
}