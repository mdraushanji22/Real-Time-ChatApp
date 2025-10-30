import { Server } from "socket.io"; // This is socket.io server

const userSocketMap = {}; //Mapping... User id with socketMap
let io;

export function initSocket(server) {
  // Updated CORS configuration to allow multiple origins
  const allowedOrigins = [
    "https://real-time-chatapp-frontend-xas7.onrender.com",
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ].filter(Boolean); // Filter out any undefined values

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });
  
  io.on("connection", (socket) => {
    console.log("A User connected to the server", socket.id); // send socket.id from frontend
    const userId = socket.handshake.query.userId; // get user id
    
    // Validate userId
    if (userId && typeof userId === 'string') {
      userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      // Remove user from socket map
      for (const [key, value] of Object.entries(userSocketMap)) {
        if (value === socket.id) {
          delete userSocketMap[key];
          break;
        }
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

export { io };