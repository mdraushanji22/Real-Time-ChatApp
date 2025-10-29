import { io } from "socket.io-client";

let socket = null;
export const connectSocket = (userId) => {
  // Updated to use deployed backend URL in production
  const socketURL = import.meta.env.MODE === "development" 
    ? "https://real-time-chatapp-backend-foiz.onrender.com" 
    : "/";

  socket = io(socketURL, {
    query: { userId },
  });
  return socket;
};
export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
