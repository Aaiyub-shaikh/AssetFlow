// Centralized Error Handling Middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log to console for dev
  if (process.env.NODE_ENV !== 'production') {
    console.error(err)
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`
    return res.status(404).json({
      success: false,
      message,
      data: null,
      errors: [message],
    })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered'
    return res.status(400).json({
      success: false,
      message,
      data: null,
      errors: [message],
    })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message)
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      data: null,
      errors,
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized, token failed'
    return res.status(401).json({
      success: false,
      message,
      data: null,
      errors: [message],
    })
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Not authorized, token expired'
    return res.status(401).json({
      success: false,
      message,
      data: null,
      errors: [message],
    })
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    data: null,
    errors: err.errors || [error.message || 'Server Error'],
  })
}

// Custom Error Class to format API responses
export class ErrorResponse extends Error {
  constructor(message, statusCode, errors = []) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
  }
}
