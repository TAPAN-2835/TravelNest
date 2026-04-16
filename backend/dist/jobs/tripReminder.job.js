"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTripReminderJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = require("../config/database");
const email_utils_1 = require("../shared/utils/email.utils");
const socket_1 = require("../config/socket");
const setupTripReminderJob = () => {
    // Every day at 9:00 AM "0 9 * * *"
    node_cron_1.default.schedule('0 9 * * *', async () => {
        console.log('Running Trip Reminder Job...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const nextDay = new Date(tomorrow);
        nextDay.setDate(nextDay.getDate() + 1);
        const upcomingTrips = await database_1.prisma.trip.findMany({
            where: {
                startDate: {
                    gte: tomorrow,
                    lt: nextDay,
                },
            },
            include: { user: true, destination: true },
        });
        for (const trip of upcomingTrips) {
            // 1. Send Email
            const { subject, html } = (0, email_utils_1.tripReminderEmail)(trip, trip.user);
            await (0, email_utils_1.sendEmail)(trip.user.email, subject, html);
            // 2. Create Alert
            const alert = await database_1.prisma.alert.create({
                data: {
                    tripId: trip.id,
                    type: 'TRIP_REMINDER',
                    title: `Trip Reminder: ${trip.destination.name}`,
                    message: `Your trip to ${trip.destination.name} starts tomorrow! 🌍`,
                    severity: 'INFO',
                },
            });
            // 3. Emit Socket Event
            socket_1.io.to(`user:${trip.userId}`).emit('alert:new', { alert });
        }
    });
};
exports.setupTripReminderJob = setupTripReminderJob;
//# sourceMappingURL=tripReminder.job.js.map