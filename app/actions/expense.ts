'use server';

import { prisma } from '@/app/lib/prisma';
import { verifySession } from '@/app/lib/session';

export async function createExpense(data: {
  groupId: string;
  description: string;
  amount: number;
  currency: string;
}) {
  try {
    const res = await verifySession();
    if (!res.isAuth || !res.payload) {
      return { error: res.error || 'INVALID_SESSION' }
    }
    const userId = res.payload.id;

    // Verify user is member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: data.groupId,
        userId: userId,
      },
    });

    if (!membership) {
      return { error: 'You are not a member of this group' };
    }

    // Create the expense
    const expense = await prisma.expense.create({
      data: {
        ...data,
        paidById: userId,
      },
      include: {
        paidBy: {
          select: {
            username: true,
          },
        },
      },
    });

    return { success: true, expense };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { error: 'Failed to create expense' };
  }
}

export async function updateExpense(expenseId: string, data: {
  description: string;
  amount: number;
  currency: string;
}) {
  try {
    const res = await verifySession();
    if (!res.isAuth || !res.payload) {
      return { error: res.error || 'INVALID_SESSION' }
    }
    const userId = res.payload.id;

    // Verify user is the one who paid for the expense
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { paidBy: true },
    });

    if (!expense) {
      return { error: 'Expense not found' };
    }

    if (expense.paidById !== userId) {
      return { error: 'You can only edit expenses you paid for' };
    }

    // Update the expense
    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        description: data.description,
        amount: data.amount,
        currency: data.currency,
      },
      include: {
        paidBy: {
          select: {
            username: true,
          },
        },
      },
    });

    return { success: true, expense: updatedExpense };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { error: 'Failed to update expense' };
  }
}

export async function deleteExpense(expenseId: string) {
  try {
    const res = await verifySession();
    if (!res.isAuth || !res.payload) {
      return { error: res.error || 'INVALID_SESSION' }
    }
    const userId = res.payload.id;

    // Verify user is the one who paid for the expense
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { paidBy: true },
    });

    if (!expense) {
      return { error: 'Expense not found' };
    }

    if (expense.paidById !== userId) {
      return { error: 'You can only delete expenses you paid for' };
    }

    // Delete expense and related shares in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete all expense shares first
      await tx.expenseShare.deleteMany({
        where: { expenseId },
      });

      // Then delete the expense
      const deletedExpense = await tx.expense.delete({
        where: { id: expenseId },
        include: {
          paidBy: {
            select: {
              username: true,
            },
          },
        },
      });

      return deletedExpense;
    });

    return { success: true, expense: result };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { error: 'Failed to delete expense' };
  }
} 