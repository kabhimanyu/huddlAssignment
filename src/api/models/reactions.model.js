const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil, pick } = require('lodash');
const APIError = require('@utils/APIError');

const reactionsSchema = new mongoose.Schema({
   reaction: {
      type: String,
      required: true,
      enum: ["+1", "like", "dislike"]
   },
   comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reactions',
   },
   author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
   },
}, {
   timestamps: true,
});

reactionsSchema.index({ author: 1, comment: 1 }, { unique: true });

reactionsSchema.method({
   transform() {
      const transformed = {};
      const fields = ['id', 'reaction', 'comment', 'author', 'createdAt'];

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

reactionsSchema.statics = {

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
            message: 'Reactions does not exist',
            status: httpStatus.NOT_FOUND,
         });
      } catch (error) {
         throw error;
      }
   },

   async list({ page = 1, perPage = 30, comment, reaction }) {
      let options = omitBy({ comment, reaction }, isNil);

      let reactions = await this.find(options)
         .populate('author')
         .skip(perPage * (page * 1 - 1))
         .limit(perPage * 1)
         .exec();
      return reactions;

   },
};

module.exports = mongoose.model('Reactions', reactionsSchema);
