const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil, pick } = require('lodash');
const APIError = require('@utils/APIError');

const commentsSchema = new mongoose.Schema({
   text: {
      type: String,
      required: true
   },
   wall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
   },
   author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
   },
   parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      index: true,
   }
}, {
   timestamps: true,
});

commentsSchema.method({
   transform() {
      const transformed = {};
      const fields = ['id', 'text', 'wall', 'author', 'parent', 'createdAt'];

      fields.forEach((field) => {
         if (field == 'author' && this[field]["firstName"]) {
            transformed[field] = pick(this[field], ['id', 'firstName', 'lastName'])
         } else {
            transformed[field] = this[field];
         }
      });

      return transformed;
   },
})

commentsSchema.statics = {

   async get(id) {
      try {
         let comment;
         if (mongoose.Types.ObjectId.isValid(id)) {
            comment = await this.findById(id).populate('author').exec();
         }
         if (comment) {
            return comment;
         }
         throw new APIError({
            message: 'Comment does not exist',
            status: httpStatus.NOT_FOUND,
         });
      } catch (error) {
         throw error;
      }
   },

   async list({ page = 1, perPage = 30, wall, parent }) {
      let options = omitBy({ wall, parent }, isNil);

      let comments = await this.find(options)
         .populate('author')
         .skip(perPage * (page * 1 - 1))
         .limit(perPage * 1)
         .exec();
      return comments;

   },
};


module.exports = mongoose.model('Comment', commentsSchema);
