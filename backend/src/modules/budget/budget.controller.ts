import { Response, NextFunction } from 'express';
import { BudgetService } from './budget.service';
import { sendSuccess } from '../../shared/utils/response.utils';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class BudgetController {
  static async getByTripId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budget = await BudgetService.getByTripId(req.user!.id, req.params.tripId);
      sendSuccess(res, 'Budget fetched successfully', budget);
    } catch (error) {
      next(error);
    }
  }

  static async addExpense(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const expense = await BudgetService.addExpense(req.user!.id, req.params.tripId, req.body);
      sendSuccess(res, 'Expense added successfully', expense, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateExpense(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const expense = await BudgetService.updateExpense(req.user!.id, req.params.expenseId, req.body);
      sendSuccess(res, 'Expense updated successfully', expense);
    } catch (error) {
      next(error);
    }
  }

  static async deleteExpense(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await BudgetService.deleteExpense(req.user!.id, req.params.expenseId);
      sendSuccess(res, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateTotal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budget = await BudgetService.updateTotal(req.user!.id, req.params.tripId, req.body);
      sendSuccess(res, 'Budget total updated successfully', budget);
    } catch (error) {
      next(error);
    }
  }

  static async exportCSV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const csv = await BudgetService.exportCSV(req.user!.id, req.params.tripId);
      res.header('Content-Type', 'text/csv');
      res.attachment(`budget-${req.params.tripId}.csv`);
      return res.send(csv);
    } catch (error) {
      next(error);
    }
  }
}
