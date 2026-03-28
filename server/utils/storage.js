const cloudinary = require('cloudinary').v2;

const keys = require('../config/keys');

// Configure Cloudinary
cloudinary.config({
  cloud_name: keys.cloudinary.cloudName,
  api_key: keys.cloudinary.apiKey,
  api_secret: keys.cloudinary.apiSecret
});

exports.s3Upload = async image => {
  try {
    let imageUrl = '';
    let imageKey = '';

    if (image) {
      // Convert buffer to base64 data URI for Cloudinary upload
      const b64 = Buffer.from(image.buffer).toString('base64');
      const dataURI = 'data:' + image.mimetype + ';base64,' + b64;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'ecommerce',
        resource_type: 'image'
      });

      imageUrl = result.secure_url;
      imageKey = result.public_id;
    }

    return { imageUrl, imageKey };
  } catch (error) {
    console.log('Cloudinary upload error:', error.message);
    return { imageUrl: '', imageKey: '' };
  }
};
