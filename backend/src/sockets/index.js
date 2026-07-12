import { Server } from 'socket.io'

let io

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    // User joins a room named after their database ID for targeted notifications
    socket.on('join_user', (userId) => {
      socket.join(userId)
      console.log(`👤 User joined private room: ${userId}`)
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    // If not initialized yet, we fail gracefully rather than crashing
    return null
  }
  return io
}

export const sendRealTimeNotification = (userId, notification) => {
  try {
    const socketServer = getIO()
    if (socketServer) {
      // Send to the user's private socket room
      socketServer.to(userId.toString()).emit('notification', notification)
    }
  } catch (error) {
    console.error(`Socket notification error: ${error.message}`)
  }
}
