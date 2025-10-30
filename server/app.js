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

app.use(
  cors({
    origin: process.env.NODE_ENV === "development" 
      ? [process.env.FRONTEND_URL, "http://localhost:5173"] 
      : [process.env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

//Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./temp/",
  })
);

// API Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
  });
}

dbConnection();
export default app;