const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/user_controller');
const authMiddleWare = require('../app/middlewares/auth_middleware');
const paginationMiddleWare = require('../app/middlewares/pagination_middleware');
const FileUploader = require('../app/helpers/file_uploader');

const profilePhotoUploader = new FileUploader({uploadPath: 'profile'});


router.route('/')
      .get([authMiddleWare.jwtAuthentication], UserController.getCurrentUser);
router.route('/favorites/jokes')
      .get([authMiddleWare.jwtAuthentication, paginationMiddleWare], UserController.getUserFavoriteJokes);
router.route('/photo')
      .put([authMiddleWare.jwtAuthentication, profilePhotoUploader.imageUploadMiddleWare()], UserController.changeProfilePhoto);
           

router.route('/favorites/jokes/:jokeId')
      .put([authMiddleWare.jwtAuthentication], UserController.addJokeToFavorite)
      .delete([authMiddleWare.jwtAuthentication], UserController.removeJokeFromFavorite);

router.route('/jokes')
      .get([authMiddleWare.jwtAuthentication, paginationMiddleWare], UserController.getUserJokes);



module.exports = router;