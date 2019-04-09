const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const redisClient   = require('redis').createClient();
const passport = require('passport');
const validator = require('express-validator');
const httpStatus = require('http-status');
const nconf = require('./config/config');
const expressValidation = require('express-validation');
const cors = require('cors');
const i18n = require("i18n");
const APIError = require('./app/helpers/api_error');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(helmet());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(logger('dev'));
app.use(helmet());
app.use(cors());

require('./config/passport')(passport);
app.use(passport.initialize());

app.use(validator());

i18n.configure({
	defaultLocale: 'en',
	directory: __dirname + '/locales'
});
i18n.setLocale('de');
app.use(i18n.init);

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
	max: 100,
	message: 'Too many requests. Please try again later.'
}); 

app.use(apiLimiter);

require('./app/router')(app);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

expressValidation.options({
  status: 422,
  statusText: 'Unprocessable Entity'
});


app.use((err, req, res, next) => {
		if (err instanceof expressValidation.ValidationError) {
			// validation error contains errors which is an array of error each containing message[]
			//const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
			message = 'Validation failed';
			const error = new APIError(message, true, err.status, err.errors);
			return next(error);
		} else if (!(err instanceof APIError)) {
			console.log('------------FINAL ERROR ------------');
			console.log(err);
			const apiError = new APIError(err.message, false, err.status);
			return next(apiError);
		}
		return next(err);
  });
  
  // catch 404 and forward to error handler
  app.use((req, res, next) => {
	const err = new APIError('API URI not found', true, httpStatus.NOT_FOUND);
	console.log(err);
	return next(err);
  });

  app.use((err, req, res, next) => {

		let responseBody = {};
		responseBody.message = err.isPublic ? err.message : httpStatus[err.status];
		if(nconf.get('env') === 'development'){
			responseBody.stack = err.stack;
		}
		if(err.errors){
			responseBody.errors = err.errors;
		}
		return res.status(err.status).json(responseBody);
	}
  );

module.exports = app;
