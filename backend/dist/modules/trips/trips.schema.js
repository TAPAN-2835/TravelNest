"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTripStatusSchema = exports.updateTripSchema = exports.createTripSchema = void 0;
const zod_1 = require("zod");
exports.createTripSchema = zod_1.z.object({
    body: zod_1.z.object({
        destinationId: zod_1.z.string().uuid(),
        title: zod_1.z.string().min(2),
        startDate: zod_1.z.string().datetime(),
        endDate: zod_1.z.string().datetime(),
        totalBudget: zod_1.z.number().positive(),
        currency: zod_1.z.string().default('INR'),
        groupSize: zod_1.z.number().int().positive().default(1),
        travelStyle: zod_1.z.string(),
    }),
});
exports.updateTripSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(2).optional(),
        status: zod_1.z.enum(['PLANNING', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
        notes: zod_1.z.string().optional(),
        coverImage: zod_1.z.string().url().optional(),
    }),
});
exports.updateTripStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['PLANNING', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
    }),
});
//# sourceMappingURL=trips.schema.js.map