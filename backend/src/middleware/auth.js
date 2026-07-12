import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import { User } from '../models/User.js'
import { ErrorResponse } from './errorHandler.js'

// Protect routes
export const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find and attach user to request
    req.user = await User.findById(decoded.id).select('+password')

    if (!req.user) {
      return next(new ErrorResponse('User no longer exists', 401))
    }

    if (req.user.status === 'inactive') {
      return next(new ErrorResponse('User account has been deactivated', 403))
    }

    next()
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }
}

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Not authorized to access this route', 401))
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      )
    }
    next()
  }
}

// Request validation result parser middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMsgs = errors.array().map((err) => `${err.path}: ${err.msg}`)
    return next(new ErrorResponse('Validation error', 400, errorMsgs))
  }
  next()
}
