const { cloudinary } = require('../config/cloudinary');
const AppError = require('../utils/AppError');

const isCloudinaryConfigured = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'assetflow',
        resource_type: options.resourceType || 'auto',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

const uploadFile = async (file, folder = 'assetflow') => {
  if (!file) return null;

  if (!isCloudinaryConfigured()) {
    throw new AppError('File upload service is not configured', 503);
  }

  const isImage = file.mimetype.startsWith('image/');
  const result = await uploadToCloudinary(file.buffer, {
    folder: `${folder}/${isImage ? 'images' : 'documents'}`,
    resource_type: isImage ? 'image' : 'raw',
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    bytes: result.bytes,
  };
};

const uploadMultiple = async (files, folder = 'assetflow') => {
  if (!files?.length) return [];
  return Promise.all(files.map((file) => uploadFile(file, folder)));
};

const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured() || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete failed:', error.message);
  }
};

module.exports = {
  uploadFile,
  uploadMultiple,
  deleteFromCloudinary,
  isCloudinaryConfigured,
};
