/**
 * Generate public URL from S3 key
 * @param {string} s3Key - S3 object key
 * @returns {string} Public URL
 */
function getS3PublicUrl(s3Key) {
  if (!s3Key) return null;
  
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  
  if (!bucket || !region) {
    throw new Error('AWS_S3_BUCKET_NAME and AWS_REGION must be configured');
  }
  
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURI(s3Key)}`;
}

module.exports = getS3PublicUrl;
