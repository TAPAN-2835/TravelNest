import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const generateUploadUrl = async (userId: string, fileName: string, fileType: string, documentType: string) => {
  const s3Key = `documents/${userId}/${uuidv4()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: s3Key,
    ContentType: fileType,
    Metadata: { userId, documentType },
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  return { uploadUrl, s3Key };
};

export const generateDownloadUrl = async (s3Key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: s3Key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
