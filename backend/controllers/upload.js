import cloudinary from '../libs/cloudinary.js';

/**
 * Upload image to Cloudinary
 * Accepts base64 image data and returns the secure URL
 */
const uploadImage = async (req, res) => {
  try {
    const { image, folder = 'profile-pictures' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Upload to Cloudinary (no transformation to maintain original quality)
    const result = await cloudinary.uploader.upload(image, {
      folder: `taskhub/${folder}`,
      resource_type: 'image',
    });

    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};

export { uploadImage, deleteImage };
