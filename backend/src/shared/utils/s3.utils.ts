import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { s3Client } from '../../config/aws';

export const generateUploadUrl = async (userId: string, fileName: string, fileType: string, documentType: string) => {
  const s3Key = `documents/${userId}/${uuidv4()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: s3Key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  return { uploadUrl, s3Key };
};

export const generateDownloadUrl = async (s3Key: string, versionId?: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: s3Key,
    ...(versionId && { VersionId: versionId }),
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
