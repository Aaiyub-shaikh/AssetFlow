require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./app');
const connectDB = require('./config/database');
const { configureCloudinary } = require('./config/cloudinary');
const { configureEmail } = require('./config/email');
const { initializeSocket } = require('./sockets');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    configureCloudinary();
    configureEmail();

    const app = createApp();
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    initializeSocket(io);

    server.listen(PORT, () => {
      console.log(`AssetFlow API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
