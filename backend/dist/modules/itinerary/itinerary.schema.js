"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateItinerarySchema = exports.updateItineraryDaySchema = exports.generateItinerarySchema = void 0;
const zod_1 = require("zod");
exports.generateItinerarySchema = zod_1.z.object({
    body: zod_1.z.object({
        tripId: zod_1.z.string().uuid().optional(),
        destination: zod_1.z.string(),
        country: zod_1.z.string().optional(),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
        budget: zod_1.z.number().positive().optional(),
        currency: zod_1.z.string().default('INR'),
        travelStyle: zod_1.z.string().optional(),
        groupSize: zod_1.z.number().int().positive().optional(),
        interests: zod_1.z.array(zod_1.z.string()).optional(),
        days: zod_1.z.number().int().positive().optional(),
        countryPreference: zod_1.z.string().optional(),
    }),
});
exports.updateItineraryDaySchema = zod_1.z.object({
    body: zod_1.z.object({
        morning: zod_1.z.any().optional(),
        afternoon: zod_1.z.any().optional(),
        evening: zod_1.z.any().optional(),
        accommodation: zod_1.z.any().optional(),
        tips: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.regenerateItinerarySchema = zod_1.z.object({
    body: zod_1.z.object({
        feedback: zod_1.z.string(),
    }),
});
//# sourceMappingURL=itinerary.schema.js.map