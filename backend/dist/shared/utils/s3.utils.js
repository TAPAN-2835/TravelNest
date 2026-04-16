"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDownloadUrl = exports.generateUploadUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const aws_1 = require("../../config/aws");
const generateUploadUrl = async (userId, fileName, fileType, documentType) => {
    const s3Key = `documents/${userId}/${(0, uuid_1.v4)()}-${fileName}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        ContentType: fileType,
    });
    const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(aws_1.s3Client, command, { expiresIn: 900 });
    return { uploadUrl, s3Key };
};
exports.generateUploadUrl = generateUploadUrl;
const generateDownloadUrl = async (s3Key, versionId) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        ...(versionId && { VersionId: versionId }),
    });
    return await (0, s3_request_presigner_1.getSignedUrl)(aws_1.s3Client, command, { expiresIn: 3600 });
};
exports.generateDownloadUrl = generateDownloadUrl;
//# sourceMappingURL=s3.utils.js.map