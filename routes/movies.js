const express = require('express');
const router = express.Router();
const MovieController = require('../app/controllers/movie_controller');
const authMiddleWare = require('../app/middlewares/auth_middleware');
const paginationMiddleWare = require('../app/middlewares/pagination_middleware');


router.route('/:movieId')
      .get(MovieController.getMovie);

router.route('/:movieId/jokes')
      .get([authMiddleWare.jwtOptionalAuthentication, paginationMiddleWare],MovieController.getMovieJokes);
module.exports = router;