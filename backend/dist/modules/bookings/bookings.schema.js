"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        tripId: zod_1.z.string().uuid(),
        destinationId: zod_1.z.string().uuid(),
        type: zod_1.z.enum(['HOTEL', 'FLIGHT', 'ACTIVITY', 'TRANSPORT']),
        providerName: zod_1.z.string(),
        checkIn: zod_1.z.string().datetime().optional(),
        checkOut: zod_1.z.string().datetime().optional(),
        amount: zod_1.z.number().positive(),
        currency: zod_1.z.string().default('INR'),
        details: zod_1.z.any(),
    }),
});
exports.updateBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED']).optional(),
        confirmationNo: zod_1.z.string().optional(),
        details: zod_1.z.any().optional(),
    }),
});
//# sourceMappingURL=bookings.schema.js.map