import app from "./app.js";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
import { initSocket } from "./utils/socket.js";
import { config } from "dotenv";

// Load environment variables
config({ path: "./config/config.env" });

console.log("Starting server with environment:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT || 4000);
console.log("Cloudinary config:");
console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key:", process.env.CLOUDINARY_API_KEY);
console.log("API secret:", process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
cloudinary.uploader.ping()
  .then(result => console.log("Cloudinary connection successful:", result))
  .catch(error => console.error("Cloudinary connection failed:", error));

const server = http.createServer(app);
initSocket(server);
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${process.env.NODE_ENV} Mode`
  );
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});