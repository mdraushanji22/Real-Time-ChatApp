import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import catchAsyncError from "./catchAsyncError.middleware.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  console.log("=== AUTHENTICATION MIDDLEWARE ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Full URL:", req.protocol + '://' + req.get('host') + req.originalUrl);
  console.log("Cookies:", req.cookies);
  console.log("Headers:", req.headers);
  
  // Get token from cookies
  const { token } = req.cookies;
  
  // Also check for token in Authorization header (Bearer token)
  let headerToken = null;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    headerToken = req.headers.authorization.split(" ")[1];
  }
  
  const finalToken = token || headerToken;
  
  console.log("Final token:", finalToken);
  
  // Check if token exists
  if (!finalToken) {
    console.log("No token found - returning 401");
    return res.status(401).json({
      success: false,
      message: "User not authenticated please sign in",
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET_KEY);
    console.log("Decoded token:", decoded);
    
    // Check if decoded token has user id
    if (!decoded || !decoded.id) {
      console.log("Invalid token structure");
      return res.status(401).json({
        success: false,
        message: "Token Verification failed: Please sign in again",
      });
    }
    
    // Find user by id
    const user = await User.findById(decoded.id);
    console.log("Found user:", user);
    
    // Check if user exists
    if (!user) {
      console.log("User not found");
      return res.status(401).json({
        success: false,
        message: "User not found. Please sign in again.",
      });
    }
    
    // Attach user to request object
    req.user = user;
    console.log("Authentication successful");
    next();
  } catch (error) {
    console.log("Token verification error:", error);
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