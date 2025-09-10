import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { register, login, getMe } from './controllers/authController';
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from './controllers/eventController';
import { getUserProfile, getUserStats, updateUserProfile } from './controllers/userController';
import { auth } from './middleware/auth';
import multer from 'multer';
import cloudinary from './config/cloudinary';
import User from './models/User';
import { AuthRequest } from './types/express';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:8084'],
  credentials: true
}));
app.use(express.json());

// Test MongoDB connection
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB Connected Successfully');
    
    // Auth routes
    app.post('/api/auth/register', register);
    app.post('/api/auth/login', login);
    app.get('/api/auth/me', auth, getMe);
    
    // Events routes
    app.get('/api/events', getAllEvents);
    app.get('/api/events/:id', getEventById);
    app.post('/api/events', auth, createEvent);
    app.put('/api/events/:id', auth, updateEvent);
    app.delete('/api/events/:id', auth, deleteEvent);
    
    // User routes
    app.get('/api/users/:id', getUserProfile);
    app.get('/api/users/:id/stats', getUserStats);
    app.put('/api/users/:id', auth, updateUserProfile);
    
    // Configure multer for file uploads
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for videos/images
      },
      fileFilter: (req, file, cb) => {
        // Accept images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image and video files are allowed'));
        }
      }
    });
    
    // Avatar upload route with Cloudinary integration
    app.post('/api/upload/avatar', auth, upload.single('avatar'), async (req: AuthRequest, res) => {
      try {
        if (!req.file) {
          res.status(400).json({
            success: false,
            message: 'No file uploaded'
          });
          return;
        }

        const user = req.user;
        if (!user) {
          res.status(401).json({
            success: false,
            message: 'User not authenticated'
          });
          return;
        }

        // Upload to Cloudinary
        const uploadOptions = {
          folder: `event-management/avatars/${user._id}`,
          resource_type: 'image' as const,
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { format: 'auto', quality: 'auto' }
          ]
        };

        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file!.buffer);
        });

        const uploadResult = result as any;

        // Update user's avatar in database
        const updatedUser = await User.findByIdAndUpdate(
          user._id, 
          { avatar: uploadResult.secure_url },
          { new: true }
        );

        if (!updatedUser) {
          res.status(404).json({
            success: false,
            message: 'User not found'
          });
          return;
        }

        res.json({
          success: true,
          message: 'Avatar uploaded successfully',
          avatarUrl: uploadResult.secure_url,
          user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            role: updatedUser.role
          }
        });
      } catch (error: any) {
        console.error('Avatar upload error:', error);
        res.status(500).json({
          success: false,
          message: 'Server error during avatar upload',
          error: error.message
        });
      }
    });
    
    // General file upload route for events
    app.post('/api/upload', auth, upload.single('file'), async (req: AuthRequest, res) => {
      try {
        if (!req.file) {
          res.status(400).json({
            success: false,
            message: 'No file uploaded'
          });
          return;
        }

        const user = req.user;
        if (!user) {
          res.status(401).json({
            success: false,
            message: 'User not authenticated'
          });
          return;
        }

        // Check file type
        const isImage = req.file.mimetype.startsWith('image/');
        const isVideo = req.file.mimetype.startsWith('video/');

        if (!isImage && !isVideo) {
          res.status(400).json({
            success: false,
            message: 'Only image and video files are allowed'
          });
          return;
        }

        // Upload to Cloudinary
        const uploadOptions: any = {
          folder: `event-management/events/${user._id}`,
          resource_type: isVideo ? 'video' : 'image',
          transformation: isVideo ? [] : [
            { width: 1200, height: 600, crop: 'limit', quality: 'auto' },
            { format: 'auto' }
          ]
        };

        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file!.buffer);
        });

        const uploadResult = result as any;

        res.json({
          success: true,
          message: 'File uploaded successfully',
          data: {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            fileName: req.file.originalname,
            fileType: isVideo ? 'video' : 'image',
            fileSize: req.file.size,
            format: uploadResult.format
          }
        });
      } catch (error: any) {
        console.error('Upload file error:', error);
        res.status(500).json({
          success: false,
          message: 'Server error during file upload',
          error: error.message
        });
      }
    });
    
    // Simple health check
    app.get('/api/health', (req, res) => {
      res.json({ 
        message: 'Server is running!',
        mongodb: 'Connected',
        environment: process.env.NODE_ENV || 'development',
        routes: [
          'POST /api/auth/register',
          'POST /api/auth/login', 
          'GET  /api/auth/me',
          'GET  /api/events',
          'GET  /api/events/:id',
          'POST /api/events',
          'PUT  /api/events/:id',
          'DELETE /api/events/:id',
          'GET  /api/users/:id',
          'GET  /api/users/:id/stats',
          'PUT  /api/users/:id',
          'POST /api/upload',
          'POST /api/upload/avatar',
          'GET  /api/health'
        ]
      });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:8084'}`);
      console.log(`📍 Available routes:`);
      console.log(`   POST /api/auth/register`);
      console.log(`   POST /api/auth/login`);
      console.log(`   GET  /api/auth/me`);
      console.log(`   GET  /api/events`);
      console.log(`   GET  /api/events/:id`);
      console.log(`   POST /api/events`);
      console.log(`   PUT  /api/events/:id`);
      console.log(`   DELETE /api/events/:id`);
      console.log(`   GET  /api/users/:id`);
      console.log(`   GET  /api/users/:id/stats`);
      console.log(`   PUT  /api/users/:id`);
      console.log(`   POST /api/upload/avatar`);
      console.log(`   GET  /api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
