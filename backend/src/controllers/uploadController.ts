import { Response } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../types/express';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// @desc    Upload file to Cloudinary
// @route   POST /api/upload
// @access  Private
export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    const user = req.user!;
    const file = req.file;
    const isVideo = file.mimetype.startsWith('video/');

    // Upload to Cloudinary
    const uploadOptions: any = {
      folder: `event-management/${user._id}`,
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
      uploadStream.end(file.buffer);
    });

    const uploadResult = result as any;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileName: file.originalname,
        fileType: isVideo ? 'video' : 'image',
        fileSize: file.size,
        format: uploadResult.format
      }
    });
  } catch (error: any) {
    console.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
};

// @desc    Delete file from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private
export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.body;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete file'
      });
    }
  } catch (error: any) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file deletion'
    });
  }
};

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
export const uploadMultipleFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
      return;
    }

    const user = req.user!;
    const files = req.files as Express.Multer.File[];

    const uploadPromises = files.map(async (file) => {
      const isVideo = file.mimetype.startsWith('video/');
      
      const uploadOptions: any = {
        folder: `event-management/${user._id}`,
        resource_type: isVideo ? 'video' : 'image',
        transformation: isVideo ? [] : [
          { width: 1200, height: 600, crop: 'limit', quality: 'auto' },
          { format: 'auto' }
        ]
      };

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve({
              url: result!.secure_url,
              publicId: result!.public_id,
              fileName: file.originalname,
              fileType: isVideo ? 'video' : 'image',
              fileSize: file.size,
              format: result!.format
            });
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: { files: uploadResults }
    });
  } catch (error: any) {
    console.error('Upload multiple files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
};

export { upload };

// @desc    Upload avatar
// @route   POST /api/upload/avatar
// @access  Private
export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No avatar file uploaded'
      });
      return;
    }

    const user = req.user!;
    const file = req.file;

    // Validate that it's an image
    if (!file.mimetype.startsWith('image/')) {
      res.status(400).json({
        success: false,
        message: 'Avatar must be an image file'
      });
      return;
    }

    // Upload to Cloudinary with avatar-specific settings
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
      uploadStream.end(file.buffer);
    });

    const uploadResult = result as any;

    // Update user's avatar in database
    const User = require('../models/User').default;
    await User.findByIdAndUpdate(user._id, { avatar: uploadResult.secure_url });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: uploadResult.secure_url,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      }
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during avatar upload'
    });
  }
};
