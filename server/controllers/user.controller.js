import catchAsyncError from "../middlewares/catchAsyncError.middleware.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateJWTToken } from "../utils/jwtToken.js";
import { v2 as cloudinary } from "cloudinary";

export const signup = catchAsyncError(async (req, res, next) => {
  console.log("Signup request received:", req.body);
  const { fullName, email, password } = req.body;
  
  // Check for required fields
  if (!fullName || !email || !password) {
    console.log("Missing required fields");
    return res.status(400).json({
      success: false,
      message: "Please provide complete details",
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("Invalid email format");
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }
  
  // Validate password length
  if (password.length < 8) {
    console.log("Password too short");
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }
  
  // Check if email already exists
  const isEmailAlreadyUsed = await User.findOne({ email });
  if (isEmailAlreadyUsed) {
    console.log("Email already exists");
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
  
  console.log("User created successfully:", user._id);
  generateJWTToken(user, "Registered successfully", 201, res);
});

export const signin = catchAsyncError(async (req, res, next) => {
  console.log("Signin request received:", req.body);
  const { email, password } = req.body;
  
  // Check for required fields
  if (!email || !password) {
    console.log("Missing email or password");
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("Invalid email format");
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }
  
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    console.log("User not found");
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }
  
  console.log("User found:", user._id);
  
  // Compare passwords
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    console.log("Password mismatch");
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }
  
  console.log("Password matched, generating token");
  generateJWTToken(user, "User successfully logged in", 200, res);
});

export const signout = catchAsyncError(async (req, res, next) => {
  console.log("Signout request received");
  return res
    .status(200)
    .cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
    .json({
      success: true,
      message: "User logout successfully",
    });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  console.log("Get user request received");
  console.log("User in request:", req.user);
  // Make sure we have a user
  if (!req.user) {
    console.log("No user in request");
    return res.status(401).json({
      success: false,
      message: "User not authenticated please sign in",
    });
  }
  
  console.log("User authenticated:", req.user._id);
  const user = req.user;
  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  try {
    console.log("Update profile request received:", req.body);
    console.log("Files received:", req.files);
    
    // Check if user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated please sign in",
      });
    }
    
    const { fullName, email } = req.body;
    const avatar = req?.files?.avatar;
    
    console.log("Update data:", { fullName, email, hasAvatar: !!avatar });
    
    // Validate input
    if (fullName?.trim().length === 0 || email?.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "FullName and email can't be empty",
      });
    }
    
    let data = {};
    
    // Update fullName if provided
    if (fullName && fullName.trim().length > 0) {
      data.fullName = fullName.trim();
    }
    
    // Update email if provided
    if (email && email.trim().length > 0) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }
      data.email = email.trim();
    }
    
    // Handle avatar removal or update
    if (req.body.avatar === "") {
      // User wants to remove their avatar
      console.log("User wants to remove avatar");
      const oldAvatarPublicId = req.user?.avatar?.public_id;
      if (oldAvatarPublicId && oldAvatarPublicId.length > 0) {
        try {
          console.log("Removing old avatar from Cloudinary:", oldAvatarPublicId);
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
        console.log("Uploading new avatar to Cloudinary...");
        console.log("Avatar file:", {
          name: avatar.name,
          size: avatar.size,
          mimetype: avatar.mimetype,
          tempFilePath: avatar.tempFilePath
        });
        
        const oldAvatarPublicId = req.user?.avatar?.public_id;
        if (oldAvatarPublicId && oldAvatarPublicId.length > 0) {
          console.log("Removing old avatar from Cloudinary:", oldAvatarPublicId);
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
        
        console.log("Cloudinary response:", cloudinaryResponse);
        
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
    
    console.log("Updating user with data:", data);
    
    // Update user
    const user = await User.findByIdAndUpdate(req.user._id, data, {
      new: true,
      runValidators: true,
    });
    
    console.log("User updated:", user);
    
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating profile",
    });
  }
});