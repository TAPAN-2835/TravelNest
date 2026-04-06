import { Router } from 'express';
import { BudgetController } from './budget.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createExpenseSchema, updateExpenseSchema, updateBudgetTotalSchema } from './budget.schema';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/budget/:tripId:
 *   get:
 *     summary: Get budget details for a trip
 *     tags: [Budget]
 */
router.get('/:tripId', BudgetController.getByTripId);

/**
 * @swagger
 * /api/budget/:tripId/expense:
 *   post:
 *     summary: Add an expense to a budget
 *     tags: [Budget]
 */
router.post('/:tripId/expense', validate(createExpenseSchema), BudgetController.addExpense);

/**
 * @swagger
 * /api/budget/:tripId/expense/:expenseId:
 *   put:
 *     summary: Update an expense
 *     tags: [Budget]
 */
router.put('/:tripId/expense/:expenseId', validate(updateExpenseSchema), BudgetController.updateExpense);

/**
 * @swagger
 * /api/budget/:tripId/expense/:expenseId:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Budget]
 */
router.delete('/:tripId/expense/:expenseId', BudgetController.deleteExpense);

/**
 * @swagger
 * /api/budget/:tripId/total:
 *   put:
 *     summary: Update total budget amount
 *     tags: [Budget]
 */
router.put('/:tripId/total', validate(updateBudgetTotalSchema), BudgetController.updateTotal);

/**
 * @swagger
 * /api/budget/:tripId/export:
 *   get:
 *     summary: Export budget as CSV
 *     tags: [Budget]
 */
router.get('/:tripId/export', BudgetController.exportCSV);

export default router;
