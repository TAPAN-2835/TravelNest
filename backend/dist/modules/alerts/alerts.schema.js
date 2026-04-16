"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastAlertSchema = exports.subscribeAlertsSchema = void 0;
const zod_1 = require("zod");
exports.subscribeAlertsSchema = zod_1.z.object({
    body: zod_1.z.object({
        tripId: zod_1.z.string().uuid(),
    }),
});
exports.broadcastAlertSchema = zod_1.z.object({
    body: zod_1.z.object({
        tripIds: zod_1.z.array(zod_1.z.string().uuid()),
        title: zod_1.z.string(),
        message: zod_1.z.string(),
        type: zod_1.z.enum(['WEATHER', 'FLIGHT_DELAY', 'TRAVEL_ADVISORY', 'TRIP_REMINDER', 'GENERAL']),
        severity: zod_1.z.enum(['INFO', 'WARNING', 'CRITICAL']),
    }),
});
//# sourceMappingURL=alerts.schema.js.map