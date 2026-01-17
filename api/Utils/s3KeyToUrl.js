const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('./s3Client');

/**
 * Convert S3 key to presigned URL using S3Client credentials (for private buckets)
 * @param {string} s3Key - S3 object key
 * @returns {Promise<string|null>} Presigned HTTPS URL (7 days validity) or null if no key provided
 */
async function s3KeyToUrl(s3Key) {
  if (!s3Key) return null;
  
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  
  if (!bucket) {
    console.error('AWS_S3_BUCKET_NAME must be configured');
    return null;
  }
  
  // Handle both S3 keys and existing URLs
  if (s3Key.startsWith('http')) {
    return s3Key; // Already a URL
  }
  
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });
    
    // Maximum allowed expiration for presigned URLs is 7 days
    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 7 * 24 * 60 * 60 // 7 days (604800 seconds)
    });
    
    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return null;
  }
}

module.exports = s3KeyToUrl;
