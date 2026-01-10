import express from 'express';
import { uploadImage, deleteImage } from '../controllers/upload.js';
import authMiddleware from '../middleware/auth-middleware.js';

const router = express.Router();

// Upload image to Cloudinary (requires authentication)
router.post('/image', authMiddleware, uploadImage);

// Delete image from Cloudinary (requires authentication)
router.delete('/image', authMiddleware, deleteImage);

export default router;
