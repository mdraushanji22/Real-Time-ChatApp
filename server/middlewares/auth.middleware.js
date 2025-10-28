import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import catchAsyncError from "./catchAsyncError.middleware.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  //   const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      //401 unauthenticated
      success: false,
      message: "User not authenticated please sign in",
    });
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!decoded) {
    return res.status(500).json({
      success: false,
      message: "Token Verification failed: Please sign in again",
    });
  }
  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found. Please sign in again.",
    });
  }
  req.user = user;
  next();
});