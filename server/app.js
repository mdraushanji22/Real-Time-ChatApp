import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import fileUpload from "express-fileupload";
import cors from "cors";
import { dbConnection } from "./database/db.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

config({ path: "./config/config.env" });

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.resolve(__dirname, "../client/dist")));
}

// Updated CORS configuration to allow multiple origins
const allowedOrigins = [
  "https://real-time-chatapp-frontend-xas7.onrender.com",
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean); // Filter out any undefined values

console.log("=== CORS CONFIGURATION ===");
console.log("Allowed origins:", allowedOrigins);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("CORS request from origin:", origin);
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log("No origin, allowing request");
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log("Origin allowed");
        callback(null, true);
      } else {
        console.log("Origin not allowed:", origin);
        callback(null, true); // Temporarily allow all origins for debugging
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

//Middleware
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./temp/",
  })
);

// Add logging middleware for debugging
app.use((req, res, next) => {
  console.log("=== INCOMING REQUEST ===");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("URL:", req.url);
  console.log("Cookies:", req.cookies);
  console.log("Headers:", req.headers);
  next();
});

//static Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.get(/.*/, (req, res) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
  });
}

dbConnection();
export default app;