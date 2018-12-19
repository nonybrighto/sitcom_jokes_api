const express = require('express');
const router = express.Router();
const AuthController = require('../app/controllers/auth_controller');
const authMiddleware = require('../app/middlewares/auth_middleware');
const passport = require('passport');

router
  .route('/login')
  .post(authMiddleware.loginLimiter,AuthController.login);

//post request should contain id_token and access_token
router.post('/google/token', AuthController.googleIdTokenAuth);
//facebook's post body should contain access_token and optionally, refresh_token 
router.post('/facebook/token', AuthController.facebookTokenAuth);

module.exports = router;