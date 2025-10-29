import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import fileUpload from "express-fileupload";
import cors from "cors";
import { dbConnection } from "./database/db.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";

const app = express();

config({ path: "./config/config.env" });

// Updated CORS configuration to allow multiple origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://real-time-chatapp-frontend-xas7.onrender.com",
  "https://real-time-chatapp-backend-foiz.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
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
//static Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter);

dbConnection();
export default app;
