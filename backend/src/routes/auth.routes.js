const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');

const router = Router();

router.post('/signup', authLimiter, signupValidator, validate, authController.signup);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);

router.use(protect);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.post('/change-password', changePasswordValidator, validate, authController.changePassword);

module.exports = router;
