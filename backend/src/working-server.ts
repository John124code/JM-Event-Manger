import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    
    // Simple routes without complex routing
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'OK',
        message: 'Event Management API is running',
        mongodb: 'Connected',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Test MongoDB connection endpoint
    app.get('/api/test-db', async (req, res) => {
      try {
        const mongoose = require('mongoose');
        const dbState = mongoose.connection.readyState;
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        
        res.json({
          status: 'success',
          database: {
            state: states[dbState] || 'unknown',
            name: mongoose.connection.name || 'cluster0',
            host: mongoose.connection.host || 'MongoDB Atlas'
          }
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: 'Database test failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Basic auth routes (without complex routing)
    app.post('/api/auth/test', (req, res) => {
      res.json({ message: 'Auth endpoint working' });
    });

    app.get('/api/events/test', (req, res) => {
      res.json({ message: 'Events endpoint working' });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`🎯 MongoDB Connected Successfully`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
