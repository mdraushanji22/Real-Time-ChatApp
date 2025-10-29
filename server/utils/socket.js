import { Server } from "socket.io"; // This is socket.io server

const userSocketMap = {}; //Mapping... User id with socketMap
let io;

export function initSocket(server) {
  // Updated CORS configuration to allow multiple origins
  const allowedOrigins = [
    "https://real-time-chatapp-frontend-xas7.onrender.com",
  ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    },
  });
  io.on("connection", (socket) => {
    console.log("A User connected to the server", socket.id); // send socket.id from frontend
    const userId = socket.handshake.query.userId; // get user id
    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      if (userId) {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
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
