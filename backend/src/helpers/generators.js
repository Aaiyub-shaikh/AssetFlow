const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const generateAssetTag = (prefix = 'AF') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
    });
  } catch (error) {
    console.error('QR code generation failed:', error.message);
    return null;
  }
};

const generateResetToken = () => uuidv4().replace(/-/g, '');

module.exports = {
  generateAssetTag,
  generateQRCode,
  generateResetToken,
};
