"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const database_1 = require("../../config/database");
const response_utils_1 = require("../../shared/utils/response.utils");
const s3_utils_1 = require("../../shared/utils/s3.utils");
const aws_1 = require("../../config/aws");
const client_s3_1 = require("@aws-sdk/client-s3");
class DocumentsService {
    static async getUploadUrl(userId, data) {
        const { fileName, fileType, documentType, tripId } = data;
        const { uploadUrl, s3Key } = await (0, s3_utils_1.generateUploadUrl)(userId, fileName, fileType, documentType);
        const document = await database_1.prisma.document.create({
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
    static async confirmUpload(userId, documentId, fileSize) {
        return await database_1.prisma.document.update({
            where: { id: documentId, userId },
            data: { fileSize },
        });
    }
    static async getAll(userId, tripId, type) {
        const where = {
            userId,
            fileSize: { gt: 0 } // Only return documents that have been successfully uploaded and confirmed
        };
        if (tripId)
            where.tripId = tripId;
        if (type)
            where.type = type;
        const documents = await database_1.prisma.document.findMany({ where });
        // Generate fresh download URLs
        const docsWithUrls = await Promise.all(documents.map(async (doc) => ({
            ...doc,
            downloadUrl: await (0, s3_utils_1.generateDownloadUrl)(doc.s3Key),
        })));
        return docsWithUrls;
    }
    static async delete(userId, id) {
        const document = await database_1.prisma.document.findUnique({ where: { id } });
        if (!document || document.userId !== userId) {
            throw new response_utils_1.AppError('Document not found', 404);
        }
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: document.s3Key,
        });
        await aws_1.s3Client.send(command);
        await database_1.prisma.document.delete({ where: { id } });
    }
    static async getDownloadUrl(userId, id) {
        const document = await database_1.prisma.document.findUnique({ where: { id } });
        if (!document || document.userId !== userId) {
            throw new response_utils_1.AppError('Document not found', 404);
        }
        return await (0, s3_utils_1.generateDownloadUrl)(document.s3Key);
    }
}
exports.DocumentsService = DocumentsService;
//# sourceMappingURL=documents.service.js.map