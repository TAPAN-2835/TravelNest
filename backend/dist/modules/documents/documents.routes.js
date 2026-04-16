"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documents_controller_1 = require("./documents.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const documents_schema_1 = require("./documents.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/documents/upload-url:
 *   post:
 *     summary: Generate S3 upload URL
 *     tags: [Documents]
 */
router.post('/upload-url', (0, validate_middleware_1.validate)(documents_schema_1.uploadUrlSchema), documents_controller_1.DocumentsController.getUploadUrl);
/**
 * @swagger
 * /api/documents/confirm-upload:
 *   post:
 *     summary: Confirm document upload
 *     tags: [Documents]
 */
router.post('/confirm-upload', (0, validate_middleware_1.validate)(documents_schema_1.confirmUploadSchema), documents_controller_1.DocumentsController.confirmUpload);
/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get user documents
 *     tags: [Documents]
 */
router.get('/', documents_controller_1.DocumentsController.getAll);
/**
 * @swagger
 * /api/documents/:id:
 *   delete:
 *     summary: Delete document
 *     tags: [Documents]
 */
router.delete('/:id', documents_controller_1.DocumentsController.delete);
/**
 * @swagger
 * /api/documents/:id/download:
 *   get:
 *     summary: Get document download URL
 *     tags: [Documents]
 */
router.get('/:id/download', documents_controller_1.DocumentsController.getDownloadUrl);
exports.default = router;
//# sourceMappingURL=documents.routes.js.map