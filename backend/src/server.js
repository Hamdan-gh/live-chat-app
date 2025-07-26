// Import required packages
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import messageRouter from './routes/message.route.js';
import connectDB from './lib/db.js';
import authRoutes from './routes/auth.route.js';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());

// ✅ Updated CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://192.168.1.89:3000'
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

app.get('/', (req, res) => {
  res.send('Chat Server is Running and Connected to Database!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
