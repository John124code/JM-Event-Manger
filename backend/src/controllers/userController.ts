import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Event from '../models/Event';
import Registration from '../models/Registration';
import { AuthRequest } from '../types/express';

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
      return;
    }

    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio || '',
          location: user.location || '',
          joinedDate: user.createdAt,
          isVerified: user.isVerified || false,
          socialLinks: user.socialLinks || {}
        }
      }
    });

  } catch (error: any) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Get events created by user
    const eventsCreated = await Event.countDocuments({ creator: id });

    // Get registrations for events created by user
    const userEvents = await Event.find({ creator: id }).select('_id');
    const eventIds = userEvents.map(event => event._id);
    
    const totalRegistrations = await Registration.countDocuments({ 
      eventId: { $in: eventIds } 
    });

    // Get events user attended (registered for)
    const eventsAttended = await Registration.countDocuments({ userId: id });

    // Calculate average rating (simplified - using a basic calculation)
    const eventsWithRatings = await Event.find({ 
      creator: id,
      'ratings.0': { $exists: true }
    });

    let totalRatings = 0;
    let ratingCount = 0;

    eventsWithRatings.forEach(event => {
      if (event.ratings && event.ratings.length > 0) {
        event.ratings.forEach((rating: any) => {
          totalRatings += rating.rating;
          ratingCount++;
        });
      }
    });

    const averageRating = ratingCount > 0 ? totalRatings / ratingCount : 0;

    res.json({
      success: true,
      data: {
        stats: {
          eventsCreated,
          eventsAttended,
          totalRatings: ratingCount,
          averageRating: parseFloat(averageRating.toFixed(1)),
          followers: 0, // Not implemented yet
          following: 0  // Not implemented yet
        }
      }
    });

  } catch (error: any) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user stats'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, bio, location, socialLinks } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
      return;
    }

    // Check if user is updating their own profile
    if (req.user!.id !== id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (socialLinks) updateData.socialLinks = socialLinks;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio || '',
          location: user.location || '',
          joinedDate: user.createdAt,
          isVerified: user.isVerified || false,
          socialLinks: user.socialLinks || {}
        }
      }
    });

  } catch (error: any) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user profile'
    });
  }
};
