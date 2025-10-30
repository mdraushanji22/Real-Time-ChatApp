import { io } from "socket.io-client";

let socket = null;
export const connectSocket = (userId) => {
  // Close existing socket connection if it exists
  if (socket) {
    socket.disconnect();
  }
  
  const backendUrl = import.meta.env.MODE === "development" 
    ? "http://localhost:4000" 
    : "https://real-time-chatapp-backend-foiz.onrender.com";
    
  console.log("Connecting to socket with backend URL:", backendUrl);
  
  socket = io(backendUrl, {
    query: { userId },
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });
  
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });
  
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });
  
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log("Disconnecting socket");
    socket.disconnect();
    socket = null;
  }
};