import app from "./app.js";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
import { initSocket } from "./utils/socket.js";

console.log("Cloudinary config:");
console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key:", process.env.CLOUDINARY_API_KEY);
console.log("API secret:", process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET");

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
    `server is running on port ${PORT} in ${process.env.NODE_ENV} Mode`
  );
});