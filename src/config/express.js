const express = require('express');
const bodyParser = require('body-parser');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const methodOverride = require('method-override');
const error = require('@middlewares/error');
const passport = require('passport');
const strategies = require('./passport');
const routes = require('@routes');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(compress());

app.use(methodOverride());

app.use(helmet());

app.use(cors());

passport.use('jwt', strategies.jwt);

app.use('/v1', routes)

app.use(error.converter);

app.use(error.notFound);

app.use(error.handler);

module.exports = app;