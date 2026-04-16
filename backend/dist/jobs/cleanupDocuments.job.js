"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCleanupDocumentsJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = require("../config/database");
const socket_1 = require("../config/socket");
const setupCleanupDocumentsJob = () => {
    // Every Sunday at midnight "0 0 * * 0"
    node_cron_1.default.schedule('0 0 * * 0', async () => {
        console.log('Running Document Cleanup Job...');
        const today = new Date();
        const expiredDocs = await database_1.prisma.document.findMany({
            where: {
                expiryDate: { lt: today },
            },
        });
        for (const doc of expiredDocs) {
            if (doc.tripId) {
                const alert = await database_1.prisma.alert.create({
                    data: {
                        tripId: doc.tripId,
                        type: 'GENERAL',
                        title: 'Document Expired',
                        message: `Your document "${doc.name}" has expired.`,
                        severity: 'WARNING',
                    },
                });
                socket_1.io.to(`user:${doc.userId}`).emit('alert:new', { alert });
            }
        }
    });
};
exports.setupCleanupDocumentsJob = setupCleanupDocumentsJob;
//# sourceMappingURL=cleanupDocuments.job.js.map