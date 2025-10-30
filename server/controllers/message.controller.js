import catchAsyncError from "../middlewares/catchAsyncError.middleware.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getReceiverSocketId, getIO } from "../utils/socket.js";

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const filteredUsers = await User.find({ _id: { $ne: user._id } }).select(
      "-password"
    );
    res.status(200).json({
      success: true,
      users: filteredUsers,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export const getMessages = catchAsyncError(async (req, res, next) => {
  try {
    const receiverId = req.params.id;
    const myId = req.user._id;
    
    console.log("Get messages request:", { receiverId, myId });
    
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(400).json({
        success: false,
        message: "Receiver Id Invalid",
      });
    }
    
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: receiverId },
        { senderId: receiverId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });
    
    console.log("Found messages:", messages.length);
    
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export const sendMessage = catchAsyncError(async (req, res, next) => {
  try {
    const { text } = req.body;
    const media = req?.files?.media;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    
    console.log("Send message request:", { text, receiverId, senderId, hasMedia: !!media });
    
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(400).json({
        success: false,
        message: "Receiver Id Invalid",
      });
    }
    
    const sanitizedText = text?.trim() || "";
    if (!sanitizedText && !media) {
      return res.status(400).json({
        success: false,
        message: "Cannot send empty message.",
      });
    }
    
    let mediaUrl = "";
    if (media) {
      try {
        console.log("Uploading media to Cloudinary...");
        console.log("Media file:", {
          name: media.name,
          size: media.size,
          mimetype: media.mimetype,
          tempFilePath: media.tempFilePath
        });
        
        const uploadResponse = await cloudinary.uploader.upload(
          media.tempFilePath,
          {
            resource_type: "auto", // Detect image/video
            folder: "CHAT-APP-MEDIA",
            transformation: [
              { width: 1080, height: 1080, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          }
        );
        mediaUrl = uploadResponse?.secure_url;
        console.log("Media uploaded successfully:", mediaUrl);
      } catch (error) {
        console.log("Cloudinary upload Error", error);
        return res.status(500).json({
          success: false,
          message: "Failed to upload media please try again later",
        });
      }
    }
    
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: sanitizedText,
      media: mediaUrl,
    });
    
    console.log("Message created:", newMessage);
    
    // Populate sender and receiver info for the response
    await newMessage.populate([
      { path: "senderId", select: "fullName avatar" },
      { path: "receiverId", select: "fullName avatar" }
    ]);
    
    // Emit to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      console.log("Emitting newMessage to receiver:", receiverSocketId);
      getIO().to(receiverSocketId).emit("newMessage", newMessage);
    }
    
    // Emit to sender (so they can see their own messages)
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      console.log("Emitting newMessage to sender:", senderSocketId);
      getIO().to(senderSocketId).emit("newMessage", newMessage);
    }
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Add delete message functionality
export const deleteMessage = catchAsyncError(async (req, res, next) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is sender or receiver
    if (
      message.senderId.toString() !== userId.toString() &&
      message.receiverId.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this message",
      });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    // Notify both sender and receiver about the deleted message
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    const senderSocketId = getReceiverSocketId(message.senderId.toString());

    if (receiverSocketId) {
      getIO().to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    if (senderSocketId && senderSocketId !== receiverSocketId) {
      getIO().to(senderSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});