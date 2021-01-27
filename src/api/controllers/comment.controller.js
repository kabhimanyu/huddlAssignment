const httpStatus = require('http-status');
const { omit, assign } = require('lodash');
const Comment = require('@models/comment.model');

exports.load = async (req, res, next, id) => {
   try {
      const comment = await Comment.get(id);
      req.locals = { comment };
      return next();
   } catch (error) {
      return next(error);
   }
};

exports.get = (req, res) => res.json(req.locals.comment.transform());

exports.create = async (req, res, next) => {
   try {
      const { _id } = req.user;
      const { text, wall } = req.body;
      const comment = new Comment({ text, wall: wall ? wall : _id, author: _id });
      const savedComment = await comment.save();
      res.status(httpStatus.CREATED);
      res.json(savedComment.transform());
   } catch (error) {
      next(error);
   }
};

exports.update = (req, res, next) => {
   const { text } = req.body;
   const comment = Object.assign(req.locals.comment, { text });

   comment.save()
      .then(savedComment => res.json(savedComment.transform()))
      .catch(e => next(e));
};

exports.list = async (req, res, next) => {
   try {
      const { _id } = req.user;
      assign(req.query, { wall: _id });
      const comments = await Comment.list(req.query);
      const transformedComments = comments.map(comment => comment.transform());
      res.json(transformedComments);
   } catch (error) {
      next(error);
   }
};

exports.remove = (req, res, next) => {
   const { comment } = req.locals;

   comment.remove()
      .then(() => res.status(httpStatus.NO_CONTENT).end())
      .catch(e => next(e));
};

exports.reply = async (req, res, next) => {
   try {
      const { _id } = req.user;
      const { commentId } = req.params;
      assign(req.body, { author: _id, parent: commentId });
      const comment = new Comment(req.body);
      const savedComment = await comment.save();
      res.status(httpStatus.CREATED);
      res.json(savedComment.transform());
   } catch (error) {
      next(error);
   }
}

exports.listSubComments = async (req, res, next) => {
   try {
      const { commentId } = req.params;
      assign(req.query, { parent: commentId });
      const comments = await Comment.list(req.query);
      const transformedComments = comments.map(comment => comment.transform());
      res.json(transformedComments);
   } catch (error) {
      next(error);
   }
};

exports.addReaction = (req, res, next) => {
   try {
      res.status(httpStatus.OK).json({ message: 'Reaction saved' })
   } catch (error) {
      next(error);
   }
}