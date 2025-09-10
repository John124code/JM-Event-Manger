import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  addEventRating,
  getUserEvents,
  getEventAnalytics,
  getFeaturedEvents
} from '../controllers/eventController';
import { auth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllEvents);
router.get('/featured', getFeaturedEvents);

// Private routes that need to be before :id routes
router.get('/user/my-events', auth, getUserEvents);

// Public parameterized routes
router.get('/:id', getEventById);

// Private parameterized routes
router.post('/', auth, createEvent);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);
router.post('/:id/ratings', auth, addEventRating);
router.get('/:id/analytics', auth, getEventAnalytics);

export default router;
