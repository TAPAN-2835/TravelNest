"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetController = void 0;
const budget_service_1 = require("./budget.service");
const response_utils_1 = require("../../shared/utils/response.utils");
class BudgetController {
    static async getByTripId(req, res, next) {
        try {
            const budget = await budget_service_1.BudgetService.getByTripId(req.user.id, req.params.tripId);
            (0, response_utils_1.sendSuccess)(res, 'Budget fetched successfully', budget);
        }
        catch (error) {
            next(error);
        }
    }
    static async addExpense(req, res, next) {
        try {
            const expense = await budget_service_1.BudgetService.addExpense(req.user.id, req.params.tripId, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Expense added successfully', expense, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateExpense(req, res, next) {
        try {
            const expense = await budget_service_1.BudgetService.updateExpense(req.user.id, req.params.expenseId, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Expense updated successfully', expense);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteExpense(req, res, next) {
        try {
            await budget_service_1.BudgetService.deleteExpense(req.user.id, req.params.expenseId);
            (0, response_utils_1.sendSuccess)(res, 'Expense deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateTotal(req, res, next) {
        try {
            const budget = await budget_service_1.BudgetService.updateTotal(req.user.id, req.params.tripId, req.body);
            (0, response_utils_1.sendSuccess)(res, 'Budget total updated successfully', budget);
        }
        catch (error) {
            next(error);
        }
    }
    static async exportCSV(req, res, next) {
        try {
            const csv = await budget_service_1.BudgetService.exportCSV(req.user.id, req.params.tripId);
            res.header('Content-Type', 'text/csv');
            res.attachment(`budget-${req.params.tripId}.csv`);
            return res.send(csv);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BudgetController = BudgetController;
//# sourceMappingURL=budget.controller.js.map