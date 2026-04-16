"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const socket_1 = require("./config/socket");
const tripReminder_job_1 = require("./jobs/tripReminder.job");
const cleanupDocuments_job_1 = require("./jobs/cleanupDocuments.job");
require("./config/passport"); // ensure passport strategies are loaded
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(app_1.default);
// Setup Services
(0, socket_1.setupSocket)(server);
(0, tripReminder_job_1.setupTripReminderJob)();
(0, cleanupDocuments_job_1.setupCleanupDocumentsJob)();
const startServer = async () => {
    try {
        await (0, database_1.connectMongoDB)();
        await database_1.prisma.$connect();
        server.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map