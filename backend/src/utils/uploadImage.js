const { cloudinary, hasCloudinaryConfig } = require('../config/cloudinary');

const uploadImageBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    if (!buffer) {
      return resolve(null);
    }

    if (!hasCloudinaryConfig) {
      return reject(
        new Error(
          'Cloudinary credentials are missing. Please set CLOUDINARY_* environment variables.'
        )
      );
    }

    const uploadOptions = {
      folder: 'blog-management-app/posts',
      overwrite: false,
      resource_type: 'image',
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });

module.exports = {
  uploadImageBuffer,
};
