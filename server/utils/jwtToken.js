import jwt from "jsonwebtoken";

export const generateJWTToken = async (user, message, statusCode, res) => {
  console.log("Generating JWT token for user:", user._id);
  
  // Generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  
  console.log("Generated token:", token);
  
  // Set cookie options
  const cookieOptions = {
    maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000, // Convert days to milliseconds
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production", // Only secure in production
    path: "/",
  };
  
  console.log("Setting cookie with options:", cookieOptions);
  
  // Send response with token in cookie and body
  return res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
};