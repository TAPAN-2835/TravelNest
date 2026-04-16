"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        phone: zod_1.z.string().optional(),
        nationality: zod_1.z.string().optional(),
        travelStyle: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
//# sourceMappingURL=users.schema.js.map