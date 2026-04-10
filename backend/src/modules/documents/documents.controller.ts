import { Response, NextFunction } from 'express';
import { DocumentsService } from './documents.service';
import { sendSuccess } from '../../shared/utils/response.utils';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class DocumentsController {
  static async getUploadUrl(req: any, res: Response, next: NextFunction) {
    try {
      const data = await DocumentsService.getUploadUrl(req.user!.id, req.body);
      sendSuccess(res, 'Upload URL generated', data);
    } catch (error) {
      next(error);
    }
  }

  static async confirmUpload(req: any, res: Response, next: NextFunction) {
    try {
      const document = await DocumentsService.confirmUpload(
        req.user!.id,
        req.body.documentId,
        req.body.fileSize
      );
      sendSuccess(res, 'Upload confirmed', document);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: any, res: Response, next: NextFunction) {
    try {
      const documents = await DocumentsService.getAll(
        req.user!.id,
        req.query.tripId as string,
        req.query.type
      );
      sendSuccess(res, 'Documents fetched successfully', documents);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: any, res: Response, next: NextFunction) {
    try {
      await DocumentsService.delete(req.user!.id, req.params.id);
      sendSuccess(res, 'Document deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getDownloadUrl(req: any, res: Response, next: NextFunction) {
    try {
      const downloadUrl = await DocumentsService.getDownloadUrl(req.user!.id, req.params.id);
      sendSuccess(res, 'Download URL fetched', { downloadUrl });
    } catch (error) {
      next(error);
    }
  }
}
