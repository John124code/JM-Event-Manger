import { Router } from 'express';
import {
  registerForEvent,
  getUserRegistrations,
  getEventRegistrations,
  updatePaymentStatus,
  cancelRegistration,
  checkRegistration
} from '../controllers/registrationController';
import { auth } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(auth);

// Routes
router.post('/', registerForEvent);
router.get('/my-registrations', getUserRegistrations);
router.get('/event/:eventId', getEventRegistrations);
router.put('/:id/payment-status', updatePaymentStatus);
router.delete('/:id', cancelRegistration);
router.get('/check/:eventId', checkRegistration);

export default router;
