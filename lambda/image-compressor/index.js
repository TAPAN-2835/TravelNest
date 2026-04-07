const AWS = require('aws-sdk');
const sharp = require('sharp');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  
  if (key.includes('processed-')) {
    console.log('Skipping already processed image');
    return;
  }

  try {
    const response = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    const contentType = response.ContentType;

    if (!contentType || !contentType.startsWith('image/')) {
        console.log('Skipping non-image file');
        return;
    }

    const buffer = await sharp(response.Body)
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const newKey = key.replace('documents/', 'documents/processed-');
    
    await s3.putObject({
      Bucket: bucket,
      Key: newKey,
      Body: buffer,
      ContentType: 'image/jpeg',
      Metadata: { ...response.Metadata, processed: 'true' }
    }).promise();

    console.log(`Successfully compressed image: ${key} -> ${newKey}`);
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};
