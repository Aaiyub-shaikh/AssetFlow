const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx|xls|xlsx|csv/;

  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const isImage = allowedImageTypes.test(ext) && file.mimetype.startsWith('image/');
  const isDoc =
    allowedDocTypes.test(ext) ||
    file.mimetype === 'application/pdf' ||
    file.mimetype.includes('document') ||
    file.mimetype.includes('spreadsheet');

  if (isImage || isDoc) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Allowed: images and documents (PDF, DOC, XLS)', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
});

module.exports = upload;
