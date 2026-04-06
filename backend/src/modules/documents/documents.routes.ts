import { Router } from 'express';
import { DocumentsController } from './documents.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uploadUrlSchema, confirmUploadSchema } from './documents.schema';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/documents/upload-url:
 *   post:
 *     summary: Generate S3 upload URL
 *     tags: [Documents]
 */
router.post('/upload-url', validate(uploadUrlSchema), DocumentsController.getUploadUrl);

/**
 * @swagger
 * /api/documents/confirm-upload:
 *   post:
 *     summary: Confirm document upload
 *     tags: [Documents]
 */
router.post('/confirm-upload', validate(confirmUploadSchema), DocumentsController.confirmUpload);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get user documents
 *     tags: [Documents]
 */
router.get('/', DocumentsController.getAll);

/**
 * @swagger
 * /api/documents/:id:
 *   delete:
 *     summary: Delete document
 *     tags: [Documents]
 */
router.delete('/:id', DocumentsController.delete);

/**
 * @swagger
 * /api/documents/:id/download:
 *   get:
 *     summary: Get document download URL
 *     tags: [Documents]
 */
router.get('/:id/download', DocumentsController.getDownloadUrl);

export default router;
