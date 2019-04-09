var express = require('express');
var router = express.Router();
var validate = require('express-validation');
var userValidator = require('../app/middlewares/validators/user_validator');
var UserController = require('../app/controllers/user_controller');
const authMiddleWare = require('../app/middlewares/auth_middleware');
const paginationMiddleWare = require('../app/middlewares/pagination_middleware');



router.route('/')
      //.get(UserController.getAllUsers)
      .get(authMiddleWare.jwtAuthentication, UserController.getAllUsers)
      //.post(UserController.addNewUser);
      .post(validate(userValidator.createUser), UserController.addNewUser);

router.route('/:userId/jokes')
      .get([authMiddleWare.jwtAuthentication, paginationMiddleWare], UserController.getUserJokes)


router.route('/:userId/password')
      .patch([authMiddleWare.jwtAuthentication, 
            validate(userValidator.changePassword)], UserController.changePassword)

router.route('/password')
      .post(validate(userValidator.forgotPasswordRequest), UserController.sendTokenForEmail)
      .put(validate(userValidator.changePasswordWithToken), UserController.changePasswordWithToken)

module.exports = router;