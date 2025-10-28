import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  deleteMessage,
  getAllUsers,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", isAuthenticated, getAllUsers);
router.get("/:id", isAuthenticated, getMessages);
router.post("/send/:id", isAuthenticated, sendMessage);
// Add delete message route
router.delete("/:id", isAuthenticated, deleteMessage);

export default router;