import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/response.utils';
import { generateUploadUrl, generateDownloadUrl } from '../../shared/utils/s3.utils';
import { s3Client } from '../../config/aws';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export class DocumentsService {
  static async getUploadUrl(userId: string, data: any) {
    const { fileName, fileType, documentType, tripId } = data;
    const { uploadUrl, s3Key } = await generateUploadUrl(userId, fileName, fileType, documentType);

    const document = await prisma.document.create({
      data: {
        userId,
        tripId,
        type: documentType,
        name: fileName,
        s3Key,
        s3Url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
        fileSize: 0, // Updated on confirmation
        mimeType: fileType,
      },
    });

    return { 
      presignedUrl: uploadUrl, 
      fileUrl: document.s3Url,
      s3Key, 
      documentId: document.id 
    };
  }

  static async confirmUpload(userId: string, documentId: string, fileSize: number) {
    return await prisma.document.update({
      where: { id: documentId, userId },
      data: { fileSize },
    });
  }

  static async getAll(userId: string, tripId?: string, type?: any) {
    const where: any = { 
      userId,
      fileSize: { gt: 0 } // Only return documents that have been successfully uploaded and confirmed
    };
    if (tripId) where.tripId = tripId;
    if (type) where.type = type;

    const documents = await prisma.document.findMany({ where });

    // Generate fresh download URLs
    const docsWithUrls = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        downloadUrl: await generateDownloadUrl(doc.s3Key),
      }))
    );

    return docsWithUrls;
  }

  static async delete(userId: string, id: string) {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document || document.userId !== userId) {
      throw new AppError('Document not found', 404);
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: document.s3Key,
    });

    await s3Client.send(command);
    await prisma.document.delete({ where: { id } });
  }

  static async getDownloadUrl(userId: string, id: string) {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document || document.userId !== userId) {
      throw new AppError('Document not found', 404);
    }

    return await generateDownloadUrl(document.s3Key);
  }
}
