import { Router } from 'express';
import { uploadFile, deleteFile, uploadMultipleFiles, upload } from '../controllers/uploadController';
import { auth } from '../middleware/auth';

const router = Router();

// All upload routes require authentication
router.use(auth);

// Routes
router.post('/', upload.single('file'), uploadFile);
router.post('/multiple', upload.array('files', 10), uploadMultipleFiles);
router.delete('/:publicId', deleteFile);

export default router;
