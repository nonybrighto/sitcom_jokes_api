var express = require('express');
var router = express.Router();
var UserController = require('../app/controllers/user_controller');
const authMiddleWare = require('../app/middlewares/auth_middleware');
const paginationMiddleWare = require('../app/middlewares/pagination_middleware');


router.route('/favorites/jokes')
      .get([authMiddleWare.jwtAuthentication, paginationMiddleWare], UserController.getUserFavoriteJokes)

router.route('/liked/joke/:jokeId')
      .put([authMiddleWare.jwtOptionalAuthentication],UserController.likeJoke)
      .delete([authMiddleWare.jwtAuthentication],UserController.unlikeJoke)

router.route('/favorited/joke/:jokeId')
      .put([authMiddleWare.jwtAuthentication], UserController.addJokeToFavorite)
      .delete([authMiddleWare.jwtAuthentication], UserController.removeJokeFromFavorite)

router.route('/jokes')
      .get([authMiddleWare.jwtAuthentication, paginationMiddleWare], UserController.getUserJokes)



module.exports = router;