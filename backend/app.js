import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { errorHandler } from './src/middleware/errorHandler.js'

// Import Routes
import authRoutes from './src/routes/auth.js'

const app = express()

// Security Middlewares
app.use(helmet())
app.use(cors({
  origin: '*', // Allow connections from frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Logging Middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', limiter)

// API routes
app.use('/api/auth', authRoutes)

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AssetFlow ERP API is healthy and running',
    timestamp: new Date(),
  })
})

// 404 Page Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    data: null,
    errors: [`Route ${req.originalUrl} not found`],
  })
})

// Centralized Error Handler
app.use(errorHandler)

export default app
