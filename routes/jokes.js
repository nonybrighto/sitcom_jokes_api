const express = require('express');
const router = express.Router();
const validate = require('express-validation');
const jokeValidator = require('../app/middlewares/validators/joke_validator');
const commentValidator = require('../app/middlewares/validators/comment_validator');
const JokeController = require('../app/controllers/joke_controller');
const authMiddleWare = require('../app/middlewares/auth_middleware');
const paginationMiddleWare = require('../app/middlewares/pagination_middleware');
const FileUploader = require('../app/helpers/file_uploader');

const fileUploader = new FileUploader();


router.route('/')
      .get([paginationMiddleWare, authMiddleWare.jwtOptionalAuthentication], JokeController.getJokes)                 
      .post([fileUploader.imageUploadMiddleWare({bodyValid:jokeValidator.jokeBodyValidForUpload}), authMiddleWare.jwtAuthentication, validate(jokeValidator.createJoke)], JokeController.addJoke);


router.route('/popular')
      .get([paginationMiddleWare, authMiddleWare.jwtOptionalAuthentication], JokeController.getJokes);
      
router.route('/:jokeId')
      .get(JokeController.getJoke)
      .delete([authMiddleWare.jwtAuthentication],JokeController.deleteJoke);
      
router.route('/:jokeId/likes')
            .get([paginationMiddleWare],JokeController.getJokeLikers)
            .put([authMiddleWare.jwtOptionalAuthentication],JokeController.likeJoke)
            .delete([authMiddleWare.jwtAuthentication],JokeController.unlikeJoke);

router.route('/:jokeId/comments')
            .get([paginationMiddleWare], JokeController.getJokeComments)
            .post([authMiddleWare.jwtAuthentication, validate(commentValidator.addComment)], JokeController.addJokeComment);      

module.exports = router;