var express = require('express');
var router = express.Router();
var validate = require('express-validation');
var jokeValidator = require('../app/middlewares/validators/joke_validator');
var JokeController = require('../app/controllers/joke_controller');
const authMiddleWare = require('../app/middlewares/auth_middleware');



router.route('/')
      .get(JokeController.getJokes)                 
      .post([authMiddleWare.isJwtAuthenticated, validate(jokeValidator.createJoke)], JokeController.addJoke);

router.route('/:jokeId')
      .get(JokeController.getJoke);
module.exports = router;