var express = require('express');
var router = express.Router();
var MovieController = require('../app/controllers/movie_controller');



router.route('/:movieId')
      .get(MovieController.getMovie);
module.exports = router;