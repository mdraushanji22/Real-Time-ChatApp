import { io } from "socket.io-client";

let socket = null;
export const connectSocket = (userId) => {
  // Close existing socket connection if it exists
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(
    import.meta.env.MODE === "development" ? "http://localhost:4000" : "https://real-time-chatapp-backend-foiz.onrender.com",
    {
      query: { userId },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    }
  );
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};