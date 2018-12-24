const express = require('express');
const router = express.Router();
const validate = require('express-validation');
const jokeValidator = require('../app/middlewares/validators/joke_validator');
const commentValidator = require('../app/middlewares/validators/comment_validator');
const JokeController = require('../app/controllers/joke_controller');
const authMiddleWare = require('../app/middlewares/auth_middleware');
const paginationMiddleWare = require('../app/middlewares/pagination_middleware');
const FileUploader = require('../app/helpers/file_uploader');
const multer = require('multer');


const upload = multer();

//const fileUploader = new FileUploader();


router.route('/')
      .get([paginationMiddleWare], JokeController.getJokes)                 
      .post([authMiddleWare.isJwtAuthenticated, validate(jokeValidator.createJoke), upload.single('image')], JokeController.addJoke);

router.route('/:jokeId')
      .get(JokeController.getJoke);


router.route('/:jokeId/comments')
            .get([paginationMiddleWare], JokeController.getJokeComments)
            .post([authMiddleWare.isJwtAuthenticated, validate(commentValidator.addComment)], JokeController.addJokeComment);      

module.exports = router;