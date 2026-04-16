"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBudgetTotalSchema = exports.updateExpenseSchema = exports.createExpenseSchema = void 0;
const zod_1 = require("zod");
exports.createExpenseSchema = zod_1.z.object({
    body: zod_1.z.object({
        category: zod_1.z.enum(['FLIGHTS', 'HOTELS', 'FOOD', 'ACTIVITIES', 'TRANSPORT', 'SHOPPING', 'MISC']),
        description: zod_1.z.string(),
        amount: zod_1.z.number().positive(),
        date: zod_1.z.string().datetime(),
        receiptUrl: zod_1.z.string().url().optional(),
    }),
});
exports.updateExpenseSchema = exports.createExpenseSchema.partial();
exports.updateBudgetTotalSchema = zod_1.z.object({
    body: zod_1.z.object({
        totalAmount: zod_1.z.number().positive(),
        currency: zod_1.z.string(),
    }),
});
//# sourceMappingURL=budget.schema.js.map