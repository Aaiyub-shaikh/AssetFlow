import express from 'express'
import * as authController from '../controllers/authController.js'
import { protect, validate } from '../middleware/auth.js'
import {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/auth.js'

const router = express.Router()

router.post('/signup', signupValidator, validate, authController.signup)
router.post('/login', loginValidator, validate, authController.login)
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword)
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword)
router.get('/me', protect, authController.getMe)

export default router
