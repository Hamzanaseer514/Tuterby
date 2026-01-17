const { PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');
const s3Client = require('./s3Client');

/**
 * Upload a Multer file buffer to S3 under the given folder and return S3 key
 * @param {Express.Multer.File} file - Multer file (memory storage)
 * @param {string} folderName - e.g., 'documents' or 'profile'
 * @returns {Promise<string>} S3 key for the uploaded file
 */
async function uploadToS3(file, folderName) {
  if (!file) {
    throw new Error('No file provided');
  }
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  const safeFolder = (folderName || 'uploads').replace(/\\+/g, '/').replace(/^\/+|\/+$/g, '');
  const ext = path.extname(file.originalname) || '';
  const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_\.]/g, '_');
  const random = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  const key = `${safeFolder}/${base}-${timestamp}-${random}${ext}`;

  const contentType = file.mimetype || 'application/octet-stream';

  const putParams = {
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: contentType,
  };

  try {
    await s3Client.send(new PutObjectCommand(putParams));
    return key; // Return S3 key instead of public URL
  } catch (err) {
    throw new Error(`Failed to upload to S3: ${err.message}`);
  }
}

module.exports = uploadToS3;


