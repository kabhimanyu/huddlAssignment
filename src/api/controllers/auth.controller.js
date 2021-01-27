const httpStatus = require('http-status');
const User = require('@models/user.model');
const { jwtExpirationInterval } = require('@config/vars');
const moment = require('moment-timezone');

exports.register = async (req, res, next) => {
   try {
      const user = await new User(req.body).save();
      const userTransformed = user.transform();
      const token = { tokenType: 'Bearer', accessToken: user.token(), expiresIn: moment().add(jwtExpirationInterval, 'minutes') }
      res.status(httpStatus.CREATED);
      return res.json({ token, user: userTransformed });
   } catch (error) {
      return next(User.checkDuplicateEmail(error));
   }
}

exports.login = async (req, res, next) => {
   try {
      const { user, accessToken } = await User.findAndGenerateToken(req.body);
      const token = { tokenType: 'Bearer', accessToken, expiresIn: moment().add(jwtExpirationInterval, 'minutes') }
      const userTransformed = user.transform();
      return res.json({ token, user: userTransformed });
   } catch (error) {
      return next(error);
   }
};