// Import required packages
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import messageRouter from './routes/message.route.js';
import connectDB from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import userModel from './models/user.model.js';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is not set!');
  process.exit(1);
}

// Create Express application
const app = express();
const server = createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: [
      'https://live-chat-app-1-k7g0.onrender.com'

    ],
    credentials: true
  }
});

// Store online users with socket mapping
const onlineUsers = new Map(); // userId -> socketId
const socketUsers = new Map(); // socketId -> userId

// Middleware for Socket.IO authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    
    console.log('Socket authentication attempt:', {
      hasToken: !!token,
      authToken: socket.handshake.auth.token ? 'Present' : 'Missing',
      headerToken: socket.handshake.headers.authorization ? 'Present' : 'Missing'
    });
    
    if (!token) {
      console.error('No token provided for socket connection');
      return next(new Error('Authentication error: No token provided'));
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    
    if (!user) {
      console.error('User not found for token:', decoded.userId);
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id;
    socket.username = user.username;
    console.log('Socket authenticated successfully for user:', user.username);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error('Authentication error: ' + error.message));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.username} (${socket.userId}) connected:`, socket.id);

  // Add user to online users
  onlineUsers.set(socket.userId.toString(), socket.id);
  socketUsers.set(socket.id, socket.userId.toString());

  // Update user's online status in database
  userModel.findByIdAndUpdate(socket.userId, { isOnline: true })
    .then(() => {
      console.log(`User ${socket.username} is now online`);
      
      // Broadcast to all clients that user is online
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId.toString(),
        isOnline: true,
        username: socket.username
      });
    })
    .catch(error => {
      console.error('Error updating user online status:', error);
    });

  // Handle user joining a chat room
  socket.on('join_chat', (data) => {
    const { chatId } = data;
    socket.join(chatId);
    console.log(`User ${socket.username} joined chat: ${chatId}`);
  });

  // Handle new message
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, text, imageUrl, audioUrl } = data;
      
      // Save message to database
      const messageModel = (await import('./models/message.model.js')).default;
      const newMessage = new messageModel({
        senderId: socket.userId,
        receiverId,
        text,
        imageUrl,
        audioUrl
      });
      
      await newMessage.save();
      await newMessage.populate("senderId", "username avatar");
      await newMessage.populate("receiverId", "username avatar");

      // Emit to sender
      socket.emit('message_sent', newMessage);
      
      // Emit to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', newMessage);
      }

      console.log(`Message sent from ${socket.username} to ${receiverId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { receiverId } = data;
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', {
        userId: socket.userId.toString(),
        username: socket.username
      });
    }
  });

  socket.on('typing_stop', (data) => {
    const { receiverId } = data;
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_stopped_typing', {
        userId: socket.userId.toString(),
        username: socket.username
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`User ${socket.username} (${socket.userId}) disconnected:`, socket.id);
    
    // Remove from online users
    onlineUsers.delete(socket.userId.toString());
    socketUsers.delete(socket.id);
    
    try {
      // Update user's offline status in database
      await userModel.findByIdAndUpdate(socket.userId, { isOnline: false });
      
      // Broadcast to all clients that user is offline
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId.toString(),
        isOnline: false,
        username: socket.username
      });
      
      console.log(`User ${socket.username} is now offline`);
    } catch (error) {
      console.error('Error updating user offline status:', error);
    }
  });

  // Handle manual offline status
  socket.on('user_offline', async () => {
    try {
      await userModel.findByIdAndUpdate(socket.userId, { isOnline: false });
      onlineUsers.delete(socket.userId.toString());
      socketUsers.delete(socket.id);
      
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId.toString(),
        isOnline: false,
        username: socket.username
      });
      
      console.log(`User ${socket.username} manually went offline`);
    } catch (error) {
      console.error('Error updating user offline status:', error);
    }
  });
});

// Handle connection errors
io.engine.on('connection_error', (err) => {
  console.error('Socket.IO connection error:', err);
});

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());

// ✅ Updated CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://live-chat-app-vw20.onrender.com',
  'http://192.168.1.89:3000',
  'https://live-chat-app-1-k7g0.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Get port from environment or use 5000
const PORT = process.env.PORT || 5000;

// Connect to MongoDB database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB database');
  })
  .catch((error) => {
    console.error('❌ Database connection error:', error);
  });

// Routes
app.use('/api/auth/messages', messageRouter);
app.use('/api/auth', authRoutes);

// Redirect old routes to new API structure
app.get('/auth/check', (req, res) => {
  res.redirect('/api/auth/check');
});

app.get('/auth/messages/conversations', (req, res) => {
  res.redirect('/api/auth/messages/conversations');
});

app.get('/', (req, res) => {
  res.send('Chat Server is Running and Connected to Database!');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    socketConnections: onlineUsers.size,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Test endpoint to check online users
app.get('/api/test/online-users', (req, res) => {
  res.json({
    onlineUsers: Array.from(onlineUsers.entries()).map(([userId, socketId]) => ({
      userId,
      socketId
    })),
    totalOnline: onlineUsers.size
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io server is ready for real-time connections`);
});
