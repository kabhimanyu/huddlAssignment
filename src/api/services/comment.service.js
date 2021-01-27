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
