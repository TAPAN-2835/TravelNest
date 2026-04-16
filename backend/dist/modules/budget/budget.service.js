"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetService = void 0;
const database_1 = require("../../config/database");
const response_utils_1 = require("../../shared/utils/response.utils");
class BudgetService {
    static async getByTripId(userId, tripId) {
        const budget = await database_1.prisma.budget.findUnique({
            where: { tripId },
            include: { expenses: { orderBy: { date: 'desc' } } },
        });
        if (!budget || budget.userId !== userId) {
            throw new response_utils_1.AppError('Budget not found', 404);
        }
        const totalSpent = budget.expenses.reduce((sum, e) => sum + e.amount, 0);
        const remaining = budget.totalAmount - totalSpent;
        // Breakdown by category
        const categoryData = budget.expenses.reduce((acc, e) => {
            const existing = acc.find((item) => item.name === e.category);
            if (existing) {
                existing.value += e.amount;
            }
            else {
                acc.push({ name: e.category, value: e.amount });
            }
            return acc;
        }, []);
        // Daily spending data for Recharts
        const dailyData = budget.expenses.reduce((acc, e) => {
            const date = e.date.toISOString().split('T')[0];
            const existing = acc.find((item) => item.date === date);
            if (existing) {
                existing.amount += e.amount;
            }
            else {
                acc.push({ date, amount: e.amount });
            }
            return acc;
        }, []);
        return {
            ...budget,
            totalSpent,
            remaining,
            categoryData,
            dailyData: dailyData.sort((a, b) => a.date.localeCompare(b.date)),
        };
    }
    static async addExpense(userId, tripId, data) {
        const budget = await database_1.prisma.budget.findUnique({ where: { tripId } });
        if (!budget || budget.userId !== userId) {
            throw new response_utils_1.AppError('Budget not found', 404);
        }
        return await database_1.prisma.expense.create({
            data: {
                ...data,
                budgetId: budget.id,
            },
        });
    }
    static async updateExpense(userId, expenseId, data) {
        const expense = await database_1.prisma.expense.findUnique({
            where: { id: expenseId },
            include: { budget: true },
        });
        if (!expense || expense.budget.userId !== userId) {
            throw new response_utils_1.AppError('Expense not found', 404);
        }
        return await database_1.prisma.expense.update({
            where: { id: expenseId },
            data,
        });
    }
    static async deleteExpense(userId, expenseId) {
        const expense = await database_1.prisma.expense.findUnique({
            where: { id: expenseId },
            include: { budget: true },
        });
        if (!expense || expense.budget.userId !== userId) {
            throw new response_utils_1.AppError('Expense not found', 404);
        }
        await database_1.prisma.expense.delete({ where: { id: expenseId } });
    }
    static async updateTotal(userId, tripId, data) {
        return await database_1.prisma.budget.update({
            where: { tripId, userId },
            data,
        });
    }
    static async exportCSV(userId, tripId) {
        const budget = await this.getByTripId(userId, tripId);
        let csv = 'Date,Category,Description,Amount\n';
        budget.expenses.forEach((e) => {
            csv += `${e.date.toISOString().split('T')[0]},${e.category},"${e.description}",${e.amount}\n`;
        });
        return csv;
    }
}
exports.BudgetService = BudgetService;
//# sourceMappingURL=budget.service.js.map