import { Response } from 'express';
import mongoose from 'mongoose';
import Event, { IEvent } from '../models/Event';
import Registration from '../models/Registration';
import User from '../models/User';
import { AuthRequest } from '../types/express';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getAllEvents = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'active'
    } = req.query;

    // Build query
    const query: any = { status };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
        { location: { $regex: search as string, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const events = await Event.find(query)
      .populate('creator', 'name avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });
  } catch (error: any) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events'
    });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('creator', 'name avatar email')
      .lean();

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Increment view count
    await Event.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { event }
    });
  } catch (error: any) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const eventData = {
      ...req.body,
      creator: user._id,
      date: new Date(req.body.date)
    };

    const event = new Event(eventData);
    await event.save();

    // Populate creator data
    await event.populate('creator', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error: any) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating event'
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const event = await Event.findById(id);
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Check if user is the creator or admin
    if (event.creator.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
      return;
    }

    // Update event
    const updateData = { ...req.body };
    if (req.body.date) {
      updateData.date = new Date(req.body.date);
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('creator', 'name avatar');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event: updatedEvent }
    });
  } catch (error: any) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating event'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const event = await Event.findById(id);
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Check if user is the creator or admin
    if (event.creator.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
      return;
    }

    await Event.findByIdAndDelete(id);

    // Also delete related registrations
    await Registration.deleteMany({ eventId: id });

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event'
    });
  }
};

// @desc    Add rating to event
// @route   POST /api/events/:id/ratings
// @access  Private
export const addEventRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user = req.user!;

    const event = await Event.findById(id);
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Check if user already rated this event
    const existingRating = event.ratings.find(
      r => r.userId.toString() === user._id.toString()
    );

    if (existingRating) {
      res.status(400).json({
        success: false,
        message: 'You have already rated this event'
      });
      return;
    }

    // Add rating
    event.ratings.push({
      userId: user._id,
      userName: user.name,
      rating,
      comment,
      createdAt: new Date()
    });

    await event.save();

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: { event }
    });
  } catch (error: any) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding rating'
    });
  }
};

// @desc    Get user's events
// @route   GET /api/events/my-events
// @access  Private
export const getUserEvents = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { creator: user._id };
    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const events = await Event.find(query)
      .populate('creator', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });
  } catch (error: any) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user events'
    });
  }
};

// @desc    Get event analytics
// @route   GET /api/events/:id/analytics
// @access  Private (Creator only)
export const getEventAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const event = await Event.findById(id);
    
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Check if user is the creator or admin
    if (event.creator.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this event'
      });
      return;
    }

    // Get registration analytics
    const registrations = await Registration.find({ eventId: id });
    
    const analytics = {
      totalRegistrations: registrations.length,
      totalRevenue: registrations
        .filter(r => r.paymentStatus === 'paid')
        .reduce((sum, reg) => sum + reg.ticketPrice, 0),
      paymentStatusBreakdown: {
        paid: registrations.filter(r => r.paymentStatus === 'paid').length,
        pending: registrations.filter(r => r.paymentStatus === 'pending').length,
        refunded: registrations.filter(r => r.paymentStatus === 'refunded').length
      },
      ticketTypeBreakdown: registrations.reduce((acc: any, reg) => {
        acc[reg.ticketType] = (acc[reg.ticketType] || 0) + 1;
        return acc;
      }, {}),
      paymentMethodBreakdown: registrations.reduce((acc: any, reg) => {
        acc[reg.paymentMethod] = (acc[reg.paymentMethod] || 0) + 1;
        return acc;
      }, {}),
      views: event.views,
      averageRating: event.ratings.length > 0 
        ? (event.ratings.reduce((sum, r) => sum + r.rating, 0) / event.ratings.length).toFixed(1)
        : 0,
      totalRatings: event.ratings.length,
      recentRegistrations: registrations
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(reg => ({
          userName: reg.userName,
          userEmail: reg.userEmail,
          ticketType: reg.ticketType,
          paymentStatus: reg.paymentStatus,
          registrationDate: reg.registrationDate
        }))
    };

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error: any) {
    console.error('Get event analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
};

// @desc    Get featured events
// @route   GET /api/events/featured
// @access  Public
export const getFeaturedEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 6 } = req.query;
    const limitNum = Math.min(20, Math.max(1, parseInt(limit as string)));

    // Get events with highest views and ratings
    const events = await Event.find({ 
      status: 'active',
      date: { $gt: new Date() } // Only future events
    })
      .populate('creator', 'name avatar')
      .sort({ views: -1, 'ratings.length': -1 })
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: { events }
    });
  } catch (error: any) {
    console.error('Get featured events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured events'
    });
  }
};
