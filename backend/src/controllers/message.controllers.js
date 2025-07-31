import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    // Get data from request
    const { receiverId, text, imageUrl, audioUrl } = req.body;
    const senderId = req.user._id; // From auth middleware
    
    // Validate that we have either text, image, or audio
    if (!text && !imageUrl && !audioUrl) {
      return res.status(400).json({
        success: false,
        message: "Message must contain either text, image, or audio"
      });
    }
    
    // Validate text length if provided
    if (text && text.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Text message too long (max 1000 characters)"
      });
    }
    
    // Check if receiver exists
    const receiver = await userModel.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found"
      });
    }
    
    // Create new message
    const newMessage = new messageModel({
      senderId,
      receiverId,
      text: text?.trim(),
      imageUrl,
      audioUrl
    });
    
    // Save message to database
    await newMessage.save();
    
    // Populate sender and receiver info for response
    await newMessage.populate("senderId", "username avatar");
    await newMessage.populate("receiverId", "username avatar");
    
    // Send success response
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });
    
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error sending message",
      error: error.message
    });
  }
};



//get message
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // The other user's ID
    const myId = req.user._id;     // Current user's ID from auth middleware
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50); // Max 50 messages
    const skip = (page - 1) * limit;
    
    // Find all messages between these two users
    const messages = await messageModel.find({
      $or: [
        { senderId: myId, receiverId: userId },     // Messages I sent to them
        { senderId: userId, receiverId: myId }      // Messages they sent to me
      ]
    })
    .populate("senderId", "username avatar")
    .populate("receiverId", "username avatar")
    .sort({ createdAt: -1 })  // Newest first
    .skip(skip)
    .limit(limit);
    
    // Get total count for pagination
    const totalMessages = await messageModel.countDocuments({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId }
      ]
    });
    
    const totalPages = Math.ceil(totalMessages / limit);
    
    // Send response with messages in chronological order (oldest first)
    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: page,
          totalPages,
          totalMessages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving messages",
      error: error.message
    });
  }
};

// Delete a message (only sender can delete)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    // Find the message
    const message = await messageModel.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    
    // Check if current user is the sender
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages"
      });
    }
    
    // Delete the message
    await messageModel.findByIdAndDelete(messageId);
    
    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: { deletedMessageId: messageId }
    });
    
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting message",
      error: error.message
    });
  }
};

// Pin a message (both sender and receiver can pin)
export const pinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    // Find the message
    const message = await messageModel.findById(messageId)
      .populate("senderId", "username avatar")
      .populate("receiverId", "username avatar");
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    
    // Check if current user is involved in this message
    const isInvolved = message.senderId._id.toString() === userId.toString() || 
                      message.receiverId._id.toString() === userId.toString();
    
    if (!isInvolved) {
      return res.status(403).json({
        success: false,
        message: "You can only pin messages from your conversations"
      });
    }
    
    // Check if message is already pinned
    if (message.isPinned) {
      return res.status(400).json({
        success: false,
        message: "Message is already pinned"
      });
    }
    
    // Pin the message
    const updatedMessage = await messageModel.findByIdAndUpdate(
      messageId,
      {
        isPinned: true,
        pinnedBy: userId,
        pinnedAt: new Date()
      },
      { new: true }
    ).populate("senderId", "username avatar")
     .populate("receiverId", "username avatar")
     .populate("pinnedBy", "username");
    
    res.status(200).json({
      success: true,
      message: "Message pinned successfully",
      data: updatedMessage
    });
    
  } catch (error) {
    console.error("Pin message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error pinning message",
      error: error.message
    });
  }
};

// Unpin a message (only the user who pinned it can unpin)
export const unpinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    // Find the message
    const message = await messageModel.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    
    // Check if message is pinned
    if (!message.isPinned) {
      return res.status(400).json({
        success: false,
        message: "Message is not pinned"
      });
    }
    
    // Check if current user is the one who pinned it
    if (message.pinnedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only unpin messages that you pinned"
      });
    }
    
    // Unpin the message
    const updatedMessage = await messageModel.findByIdAndUpdate(
      messageId,
      {
        isPinned: false,
        pinnedBy: null,
        pinnedAt: null
      },
      { new: true }
    ).populate("senderId", "username avatar")
     .populate("receiverId", "username avatar");
    
    res.status(200).json({
      success: true,
      message: "Message unpinned successfully",
      data: updatedMessage
    });
    
  } catch (error) {
    console.error("Unpin message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error unpinning message",
      error: error.message
    });
  }
};

// Get pinned messages for a conversation
export const getPinnedMessages = async (req, res) => {
  try {
    const { userId } = req.params; // The other user's ID
    const myId = req.user._id;     // Current user's ID
    
    // Find pinned messages between these two users
    const pinnedMessages = await messageModel.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId }
      ],
      isPinned: true
    })
    .populate("senderId", "username avatar")
    .populate("receiverId", "username avatar")
    .populate("pinnedBy", "username")
    .sort({ pinnedAt: -1 }); // Most recently pinned first
    
    res.status(200).json({
      success: true,
      data: pinnedMessages
    });
    
  } catch (error) {
    console.error("Get pinned messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving pinned messages",
      error: error.message
    });
  }
};

//Get conversations for the current user
export const getConversations = async (req, res) => {
  try {
    const myId = req.user._id;
    
    // Find all messages where current user is either sender or receiver
    const messages = await messageModel.find({
      $or: [
        { senderId: myId },
        { receiverId: myId }
      ]
    }).populate("senderId", "username avatar").populate("receiverId", "username avatar");
    
    // Create a Set to store unique user IDs (to avoid duplicates)
    const userIds = new Set();
    
    // Go through all messages and collect the other user's ID
    messages.forEach(message => {
      if (message.senderId._id.toString() === myId.toString()) {
        // If I sent the message, add the receiver
        userIds.add(message.receiverId._id.toString());
      } else {
        // If I received the message, add the sender
        userIds.add(message.senderId._id.toString());
      }
    });
    
    // Convert Set to Array and get full user details
    const userIdsArray = Array.from(userIds);
    const users = await userModel.find({
      _id: { $in: userIdsArray }
    }).select("username avatar isOnline");
    
    res.status(200).json({
      success: true,
      data: users
    });
    
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving conversations",
      error: error.message
    });
  }
};



// Get single message details
export const getMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    // Find the message
    const message = await messageModel.findById(messageId)
      .populate("senderId", "username avatar")
      .populate("receiverId", "username avatar");
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    
    // Check if current user is involved in this message
    const isInvolved = message.senderId._id.toString() === userId.toString() || 
                      message.receiverId._id.toString() === userId.toString();
    
    if (!isInvolved) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
    
    res.status(200).json({
      success: true,
      data: message
    });
    
  } catch (error) {
    console.error("Get message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving message",
      error: error.message
    });
  }
};