import http from 'http'
import dotenv from 'dotenv'
import app from './app.js'
import { connectDB } from './src/config/db.js'
import { initSocket } from './src/sockets/index.js'

// Load Environment Variables
dotenv.config()

// Connect to MongoDB
connectDB()

// Setup HTTP Server
const server = http.createServer(app)

// Setup Socket.io
initSocket(server)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 AssetFlow server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`)
  // Close server & exit process
  server.close(() => process.exit(1))
})
