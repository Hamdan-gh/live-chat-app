import mongoose from "mongoose";


// Define simple message schema for direct messaging
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    text: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    audioUrl: {
      type: String,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pinnedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Create and export the Message model
const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;