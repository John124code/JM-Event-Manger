import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../types/express';

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid token. User not found.' 
      });
      return;
    }

    req.user = user as IUser & { _id: mongoose.Types.ObjectId };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token.' 
    });
  }
};

export const adminAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  auth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin privileges required.' 
      });
      return;
    }
    next();
  });
};

export { AuthRequest };
