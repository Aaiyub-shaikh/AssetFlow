import * as authService from '../services/authService.js'

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body
    const result = await authService.registerUser({ name, email, password, department })
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
      errors: [],
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await authService.authenticateUser({ email, password })
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
      errors: [],
    })
  } catch (error) {
    next(error)
  }
}

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    // Get host for reset url link redirection
    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`
    await authService.generatePasswordReset(email, origin)
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email',
      data: null,
      errors: [],
    })
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    const { token, id, password } = req.body
    // In case id is passed inside query or body
    const userId = id || req.query.id
    await authService.resetUserPassword(userId, token, password)
    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: null,
      errors: [],
    })
  } catch (error) {
    next(error)
  }
}

export const getMe = async (req, res, next) => {
  try {
    const user = await req.user.populate('department')
    const userObj = user.toObject()
    delete userObj.password

    res.status(200).json({
      success: true,
      message: 'User details retrieved',
      data: userObj,
      errors: [],
    })
  } catch (error) {
    next(error)
  }
}
