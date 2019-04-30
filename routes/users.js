const express = require('express');
const router = express.Router();
const validate = require('express-validation');
const userValidator = require('../app/middlewares/validators/user_validator');
const UserController = require('../app/controllers/user_controller');
const authMiddleWare = require('../app/middlewares/auth_middleware');
const paginationMiddleWare = require('../app/middlewares/pagination_middleware');



router.route('/')
      //.get(UserController.getAllUsers)
      .get([ paginationMiddleWare], UserController.getAllUsers)
      //.post(UserController.addNewUser);
      .post(validate(userValidator.createUser), UserController.addNewUser);

router.route('/:userId')
      .get([authMiddleWare.jwtOptionalAuthentication], UserController.getUser);

router.route('/:userId/followers')
      .get([ paginationMiddleWare, authMiddleWare.jwtOptionalAuthentication],UserController.getUserFollowers)
      .put([authMiddleWare.jwtAuthentication],UserController.followUser)
      .delete([authMiddleWare.jwtAuthentication],UserController.unfollowUser);

router.route('/:userId/following')
      .get([ paginationMiddleWare, authMiddleWare.jwtOptionalAuthentication],UserController.getUserFollowing);



router.route('/:userId/jokes')
      .get([authMiddleWare.jwtOptionalAuthentication, paginationMiddleWare], UserController.getUserJokes)


router.route('/:userId/password')
      .patch([authMiddleWare.jwtAuthentication, 
            validate(userValidator.changePassword)], UserController.changePassword)

router.route('/password')
      .post(validate(userValidator.forgotPasswordRequest), UserController.sendTokenForEmail)
      .put(validate(userValidator.changePasswordWithToken), UserController.changePasswordWithToken)

module.exports = router;