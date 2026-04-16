"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const documents_service_1 = require("./documents.service");
const response_utils_1 = require("../../shared/utils/response.utils");
class DocumentsController {
    static async getUploadUrl(req, res, next) {
        try {
            const data = await documents_service_1.DocumentsService.getUploadUrl(req.user.id, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Upload URL generated', data);
        }
        catch (error) {
            next(error);
        }
    }
    static async confirmUpload(req, res, next) {
        try {
            const document = await documents_service_1.DocumentsService.confirmUpload(req.user.id, req.body.documentId, req.body.fileSize);
            (0, response_utils_1.sendSuccess)(res, 'Upload confirmed', document);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAll(req, res, next) {
        try {
            const documents = await documents_service_1.DocumentsService.getAll(req.user.id, req.query.tripId, req.query.type);
            (0, response_utils_1.sendSuccess)(res, 'Documents fetched successfully', documents);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await documents_service_1.DocumentsService.delete(req.user.id, req.params.id);
            (0, response_utils_1.sendSuccess)(res, 'Document deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getDownloadUrl(req, res, next) {
        try {
            const downloadUrl = await documents_service_1.DocumentsService.getDownloadUrl(req.user.id, req.params.id);
            (0, response_utils_1.sendSuccess)(res, 'Download URL fetched', { downloadUrl });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DocumentsController = DocumentsController;
//# sourceMappingURL=documents.controller.js.map