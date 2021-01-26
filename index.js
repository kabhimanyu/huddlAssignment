Promise = require('bluebird'); // eslint-disable-line no-global-assign
require('module-alias/register')
const { port, env } = require('@config/vars');
const logger = require('@config/logger');
const mongoose = require('@config/mongoose');

mongoose.connect();