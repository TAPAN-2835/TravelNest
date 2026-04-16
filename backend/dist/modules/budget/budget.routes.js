"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const budget_controller_1 = require("./budget.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const budget_schema_1 = require("./budget.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/budget/:tripId:
 *   get:
 *     summary: Get budget details for a trip
 *     tags: [Budget]
 */
router.get('/:tripId', budget_controller_1.BudgetController.getByTripId);
/**
 * @swagger
 * /api/budget/:tripId/expense:
 *   post:
 *     summary: Add an expense to a budget
 *     tags: [Budget]
 */
router.post('/:tripId/expense', (0, validate_middleware_1.validate)(budget_schema_1.createExpenseSchema), budget_controller_1.BudgetController.addExpense);
/**
 * @swagger
 * /api/budget/:tripId/expense/:expenseId:
 *   put:
 *     summary: Update an expense
 *     tags: [Budget]
 */
router.put('/:tripId/expense/:expenseId', (0, validate_middleware_1.validate)(budget_schema_1.updateExpenseSchema), budget_controller_1.BudgetController.updateExpense);
/**
 * @swagger
 * /api/budget/:tripId/expense/:expenseId:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Budget]
 */
router.delete('/:tripId/expense/:expenseId', budget_controller_1.BudgetController.deleteExpense);
/**
 * @swagger
 * /api/budget/:tripId/total:
 *   put:
 *     summary: Update total budget amount
 *     tags: [Budget]
 */
router.put('/:tripId/total', (0, validate_middleware_1.validate)(budget_schema_1.updateBudgetTotalSchema), budget_controller_1.BudgetController.updateTotal);
/**
 * @swagger
 * /api/budget/:tripId/export:
 *   get:
 *     summary: Export budget as CSV
 *     tags: [Budget]
 */
router.get('/:tripId/export', budget_controller_1.BudgetController.exportCSV);
exports.default = router;
//# sourceMappingURL=budget.routes.js.map