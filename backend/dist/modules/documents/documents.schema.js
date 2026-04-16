"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmUploadSchema = exports.uploadUrlSchema = void 0;
const zod_1 = require("zod");
exports.uploadUrlSchema = zod_1.z.object({
    body: zod_1.z.object({
        fileName: zod_1.z.string(),
        fileType: zod_1.z.string(),
        documentType: zod_1.z.enum(['PASSPORT', 'VISA', 'TICKET', 'INSURANCE', 'HOTEL_VOUCHER', 'OTHER']),
        tripId: zod_1.z.string().uuid().optional(),
    }),
});
exports.confirmUploadSchema = zod_1.z.object({
    body: zod_1.z.object({
        documentId: zod_1.z.string().uuid(),
        fileSize: zod_1.z.number().int().positive(),
    }),
});
//# sourceMappingURL=documents.schema.js.map