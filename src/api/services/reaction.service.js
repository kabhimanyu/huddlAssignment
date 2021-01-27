const Reaction = require('@models/reactions.model');
// const httpStatus = require('http-status');
const APIError = require('@utils/APIError');

exports.addReaction = async (req, res, next) => {
   try {
      const { commentId } = req.params;
      const { user } = req;
      const { reaction } = req.body;
      let oldReaction;
      let _reaction = await Reaction.findOne({ comment: commentId, author: user });
      if (_reaction) {
         oldReaction = _reaction.reaction;
         _reaction.reaction = reaction;
      } else {
         _reaction = new Reaction({ comment: commentId, author: user, reaction })
      }
      await _reaction.save();
      if (oldReaction == reaction) {
         req.locals.reaction = {};
      } else {
         req.locals.reaction = { reaction, oldReaction };
      }

      return next();
   } catch (error) {
      next(new APIError(error));
   }
}