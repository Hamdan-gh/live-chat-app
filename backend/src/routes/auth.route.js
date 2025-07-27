// Import required packages
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import generateJWT from '../utils/generateJWT.js';
import auth from '../middleware/auth.middleware.js'
import { checkAuth, signIn, SignOut, signUp, getAllUsers } from '../controllers/auth.controllers.js';
import userModel from '../models/user.model.js';


// Create router
const router = express.Router();

router.post('/sign-up', signUp);

router.post('/sign-in', signIn);

router.get('/sign-out', auth, SignOut);

router.get('/check', auth, checkAuth);

// Get all users except the current user
router.get('/users', auth, getAllUsers);

// Get another user's profile by ID
router.get('/users/:id', auth, async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Sign-up route - POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    // Get user data from request body
    const { username, email, password } = req.body;
    
    // Check if all required fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      });
    }
    
    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }
    
    // Hash (encrypt) the password for security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user object
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword
    });
    
    // Save user to database
    const savedUser = await newUser.save();
    
    // Generate JWT token and set cookie
    const token = generateJWT(savedUser._id, res);
    
    // Send success response (don't send password back)
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token: token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        avatar: savedUser.avatar,
        isOnline: savedUser.isOnline
      }
    });
    
  } catch (error) {
    // Handle any errors
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// Login route - POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    // Get login data from request
    const { email, password } = req.body;
    
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email });
    
    // If user doesn't exist
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update user's online status
    user.isOnline = true;
    await user.save();
    
    // Generate JWT token and set cookie
    const token = generateJWT(user._id, res);
    
    // Send success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Logout route - POST /api/auth/logout
router.post('/logout', auth, async (req, res) => {
  try {
    // Update user's online status to false
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false
    });
    
    // Clear the JWT cookie
    res.cookie('jwt', '', {
      maxAge: 0,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
});

// Get current user route - GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    // req.user is set by the auth middleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
        isOnline: req.user.isOnline,
        createdAt: req.user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user information',
      error: error.message
    });
  }
});

// Update profile route - PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    // Get update data from request
    const { username, email, avatar, city, relationshipStatus, bio, location, dateOfBirth } = req.body;

    // Prepare update object (only include provided fields)
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (avatar) updateData.avatar = avatar;
    if (city) updateData.city = city;
    if (relationshipStatus) updateData.relationshipStatus = relationshipStatus;
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);

    // Check if username or email is being changed to one that already exists
    if (username || email) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.user._id } },  // Not the current user
          { $or: [
            username ? { username: username } : {},
            email ? { email: email } : {}
          ].filter(obj => Object.keys(obj).length > 0) }
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already taken by another user'
        });
      }
    }
    
    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { 
        new: true,           // Return updated document
        runValidators: true  // Run schema validations
      }
    ).select('-password');  // Don't return password
    
    console.log('Updated user:', updatedUser);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        isOnline: updatedUser.isOnline,
        city: updatedUser.city,
        relationshipStatus: updatedUser.relationshipStatus,
        bio: updatedUser.bio,
        location: updatedUser.location,
        dateOfBirth: updatedUser.dateOfBirth
      }
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during profile update',
      error: error.message
    });
  }
});

// Export the router
export default router;