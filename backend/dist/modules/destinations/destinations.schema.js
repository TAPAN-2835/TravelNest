"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDestinationSchema = exports.createDestinationSchema = void 0;
const zod_1 = require("zod");
exports.createDestinationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        country: zod_1.z.string(),
        continent: zod_1.z.string(),
        description: zod_1.z.string(),
        imageUrl: zod_1.z.string().url(),
        avgCostPerDay: zod_1.z.number().positive(),
        bestSeason: zod_1.z.array(zod_1.z.string()),
        tags: zod_1.z.array(zod_1.z.string()),
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    }),
});
exports.updateDestinationSchema = exports.createDestinationSchema.partial();
//# sourceMappingURL=destinations.schema.js.map