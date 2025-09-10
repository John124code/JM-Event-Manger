import { Response } from 'express';
import Registration from '../models/Registration';
import Event from '../models/Event';
import { AuthRequest } from '../types/express';

// @desc    Register for event
// @route   POST /api/registrations
// @access  Private
export const registerForEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      eventId,
      ticketType,
      paymentMethod,
      userPhone,
      paymentDetails
    } = req.body;

    const user = req.user!;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Check if event is active and in future
    if (event.status !== 'active') {
      res.status(400).json({
        success: false,
        message: 'Event is not active'
      });
      return;
    }

    if (new Date(event.date) < new Date()) {
      res.status(400).json({
        success: false,
        message: 'Cannot register for past events'
      });
      return;
    }

    // Check if user already registered
    const existingRegistration = await Registration.findOne({
      eventId,
      userId: user._id
    });

    if (existingRegistration) {
      res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
      return;
    }

    // Find the selected ticket type
    const selectedTicket = event.ticketTypes.find(t => t.name === ticketType);
    if (!selectedTicket) {
      res.status(400).json({
        success: false,
        message: 'Invalid ticket type'
      });
      return;
    }

    // Check ticket availability
    if (selectedTicket.available <= selectedTicket.sold) {
      res.status(400).json({
        success: false,
        message: 'No tickets available for this type'
      });
      return;
    }

    // Check event capacity
    if (event.booked >= event.capacity) {
      res.status(400).json({
        success: false,
        message: 'Event is fully booked'
      });
      return;
    }

    // Create registration
    const registration = new Registration({
      eventId,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userPhone,
      ticketType,
      ticketPrice: selectedTicket.price,
      paymentMethod,
      paymentStatus: selectedTicket.price > 0 ? 'pending' : 'paid',
      paymentDetails: selectedTicket.price > 0 ? paymentDetails : { paidAt: new Date() }
    });

    await registration.save();

    // Update event booked count and ticket sold count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { 
        booked: 1,
        'ticketTypes.$[elem].sold': 1
      }
    }, {
      arrayFilters: [{ 'elem.name': ticketType }]
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { registration }
    });
  } catch (error: any) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Get user registrations
// @route   GET /api/registrations/my-registrations
// @access  Private
export const getUserRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { userId: user._id };
    if (status) {
      query.paymentStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const registrations = await Registration.find(query)
      .populate('eventId', 'title date time location image category status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Registration.countDocuments(query);

    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });
  } catch (error: any) {
    console.error('Get user registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching registrations'
    });
  }
};

// @desc    Get event registrations (for event creator)
// @route   GET /api/registrations/event/:eventId
// @access  Private
export const getEventRegistrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const user = req.user!;
    const { page = 1, limit = 20, status } = req.query;

    // Check if event exists and user is the creator
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    if (event.creator.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view registrations for this event'
      });
      return;
    }

    const query: any = { eventId };
    if (status) {
      query.paymentStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const registrations = await Registration.find(query)
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Registration.countDocuments(query);

    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });
  } catch (error: any) {
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event registrations'
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/registrations/:id/payment-status
// @access  Private (event creator only)
export const updatePaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId, paymentReference } = req.body;
    const user = req.user!;

    const registration = await Registration.findById(id).populate('eventId');
    if (!registration) {
      res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
      return;
    }

    const event = registration.eventId as any;
    
    // Check if user is the event creator or admin
    if (event.creator.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update payment status'
      });
      return;
    }

    // Update payment details
    const updateData: any = { paymentStatus };
    if (paymentStatus === 'paid') {
      updateData['paymentDetails.paidAt'] = new Date();
    }
    if (transactionId) {
      updateData['paymentDetails.transactionId'] = transactionId;
    }
    if (paymentReference) {
      updateData['paymentDetails.paymentReference'] = paymentReference;
    }

    const updatedRegistration = await Registration.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: { registration: updatedRegistration }
    });
  } catch (error: any) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating payment status'
    });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Private
export const cancelRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const registration = await Registration.findById(id).populate('eventId');
    if (!registration) {
      res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
      return;
    }

    // Check if user owns this registration or is admin
    if (registration.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this registration'
      });
      return;
    }

    const event = registration.eventId as any;
    
    // Check if event is in the future
    if (new Date(event.date) < new Date()) {
      res.status(400).json({
        success: false,
        message: 'Cannot cancel registration for past events'
      });
      return;
    }

    // Update event counts
    await Event.findByIdAndUpdate(event._id, {
      $inc: { 
        booked: -1,
        'ticketTypes.$[elem].sold': -1
      }
    }, {
      arrayFilters: [{ 'elem.name': registration.ticketType }]
    });

    // Delete registration
    await Registration.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error: any) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling registration'
    });
  }
};

// @desc    Check if user is registered for event
// @route   GET /api/registrations/check/:eventId
// @access  Private
export const checkRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const user = req.user!;

    const registration = await Registration.findOne({
      eventId,
      userId: user._id
    });

    res.json({
      success: true,
      data: {
        isRegistered: !!registration,
        registration: registration || null
      }
    });
  } catch (error: any) {
    console.error('Check registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking registration'
    });
  }
};
