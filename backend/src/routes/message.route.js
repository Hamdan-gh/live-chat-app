import { sendMessage, getMessages, getConversations, deleteMessage, getMessage, pinMessage, unpinMessage, getPinnedMessages } from "../controllers/message.controllers.js";
import auth from "../middleware/auth.middleware.js";
import express from "express";

const messageRouter = express.Router();

messageRouter.post("/send", auth, sendMessage);                    // Send a message
messageRouter.get("/conversations", auth, getConversations); // Get all conversations
messageRouter.get("/:userId", auth, getMessages);   // Get messages for a user
messageRouter.delete("/:messageId", auth, deleteMessage); // Delete a message
messageRouter.get("/message/:messageId", auth, getMessage); // Get a single message
messageRouter.post("/:messageId/pin", auth, pinMessage); // Pin a message
messageRouter.delete("/:messageId/pin", auth, unpinMessage); // Unpin a message
messageRouter.get("/:userId/pinned", auth, getPinnedMessages); // Get pinned messages for a conversation

export default messageRouter;
