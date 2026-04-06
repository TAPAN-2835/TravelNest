import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/response.utils';

export class BudgetService {
  static async getByTripId(userId: string, tripId: string) {
    const budget = await prisma.budget.findUnique({
      where: { tripId },
      include: { expenses: { orderBy: { date: 'desc' } } },
    });

    if (!budget || budget.userId !== userId) {
      throw new AppError('Budget not found', 404);
    }

    const totalSpent = budget.expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = budget.totalAmount - totalSpent;

    // Breakdown by category
    const categoryData = budget.expenses.reduce((acc: any, e) => {
      const existing = acc.find((item: any) => item.name === e.category);
      if (existing) {
        existing.value += e.amount;
      } else {
        acc.push({ name: e.category, value: e.amount });
      }
      return acc;
    }, []);

    // Daily spending data for Recharts
    const dailyData = budget.expenses.reduce((acc: any, e) => {
      const date = e.date.toISOString().split('T')[0];
      const existing = acc.find((item: any) => item.date === date);
      if (existing) {
        existing.amount += e.amount;
      } else {
        acc.push({ date, amount: e.amount });
      }
      return acc;
    }, []);

    return {
      ...budget,
      totalSpent,
      remaining,
      categoryData,
      dailyData: dailyData.sort((a: any, b: any) => a.date.localeCompare(b.date)),
    };
  }

  static async addExpense(userId: string, tripId: string, data: any) {
    const budget = await prisma.budget.findUnique({ where: { tripId } });
    if (!budget || budget.userId !== userId) {
      throw new AppError('Budget not found', 404);
    }

    return await prisma.expense.create({
      data: {
        ...data,
        budgetId: budget.id,
      },
    });
  }

  static async updateExpense(userId: string, expenseId: string, data: any) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { budget: true },
    });

    if (!expense || expense.budget.userId !== userId) {
      throw new AppError('Expense not found', 404);
    }

    return await prisma.expense.update({
      where: { id: expenseId },
      data,
    });
  }

  static async deleteExpense(userId: string, expenseId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { budget: true },
    });

    if (!expense || expense.budget.userId !== userId) {
      throw new AppError('Expense not found', 404);
    }

    await prisma.expense.delete({ where: { id: expenseId } });
  }

  static async updateTotal(userId: string, tripId: string, data: any) {
    return await prisma.budget.update({
      where: { tripId, userId },
      data,
    });
  }

  static async exportCSV(userId: string, tripId: string) {
    const budget = await this.getByTripId(userId, tripId);
    let csv = 'Date,Category,Description,Amount\n';
    budget.expenses.forEach((e) => {
      csv += `${e.date.toISOString().split('T')[0]},${e.category},"${e.description}",${e.amount}\n`;
    });
    return csv;
  }
}
