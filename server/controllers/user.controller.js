import catchAsyncError from "../middlewares/catchAsyncError.middleware.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateJWTToken } from "../utils/jwtToken.js";
import { v2 as cloudinary } from "cloudinary";

export const signup = catchAsyncError(async (req, res, next) => {
  const { fullName, email, password } = req.body;
  
  // Check for required fields
  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide complete details",
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }
  
  // Validate password length
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }
  
  // Check if email already exists
  const isEmailAlreadyUsed = await User.findOne({ email });
  if (isEmailAlreadyUsed) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }
  
  // Hash password and create user
  const hashPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName,
    email,
    password: hashPassword,
    avatar: {
      public_id: "",
      url: "",
    },
  });
  
  generateJWTToken(user, "Registered successfully", 201, res);
});

export const signin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Check for required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }
  
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }
  
  // Compare passwords
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }
  
  generateJWTToken(user, "User successfully logged in", 200, res);
});

export const signout = catchAsyncError(async (req, res, next) => {
  return res
    .status(200)
    .cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".onrender.com" : undefined,
    })
    .json({
      success: true,
      message: "User logout successfully",
    });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { fullName, email } = req.body;
  if (fullName?.trim().length === 0 || email?.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "FullName and email can't be empty",
    });
  }

  const avatar = req?.files?.avatar;
  let data = {
    fullName,
    email,
  };

  // Handle avatar removal or update
  if (req.body.avatar === "") {
    // User wants to remove their avatar
    const oldAvatarPublicId = req.user?.avatar?.public_id;
    if (oldAvatarPublicId && oldAvatarPublicId.length > 0) {
      try {
        await cloudinary.uploader.destroy(oldAvatarPublicId);
      } catch (error) {
        console.log("Error removing avatar from Cloudinary", error);
      }
    }

    // Set avatar to default values
    data.avatar = {
      public_id: "",
      url: "",
    };
  } else if (avatar) {
    // User wants to upload a new avatar
    try {
      const oldAvatarPublicId = req.user?.avatar?.public_id;
      if (oldAvatarPublicId && oldAvatarPublicId.length > 0) {
        await cloudinary.uploader.destroy(oldAvatarPublicId);
      }

      const cloudinaryResponse = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {
          folder: "CHAT-APP-USER-AVATARS",
          transformation: [
            { width: 300, height: 300, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        }
      );

      if (cloudinaryResponse?.public_id && cloudinaryResponse?.secure_url) {
        data.avatar = {
          public_id: cloudinaryResponse.public_id,
          url: cloudinaryResponse.secure_url,
        };
      }
    } catch (error) {
      console.log("Cloudinary upload Error", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload avatar please try again later",
      });
    }
  }
  // If neither condition is met, the avatar field is not updated (keeps existing value)

  const user = await User.findByIdAndUpdate(req.user._id, data, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});