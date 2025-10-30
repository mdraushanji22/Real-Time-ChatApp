import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import catchAsyncError from "./catchAsyncError.middleware.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  // Get token from cookies
  const { token } = req.cookies;
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated please sign in",
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Check if decoded token has user id
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Token Verification failed: Please sign in again",
      });
    }
    
    // Find user by id
    const user = await User.findById(decoded.id);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please sign in again.",
      });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Handle token verification errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please sign in again.",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please sign in again.",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Token verification failed. Please sign in again.",
      });
    }
  }
});