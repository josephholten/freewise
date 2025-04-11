'use server';

import { prisma } from '@/app/lib/prisma';
import { verifyAdmin, verifySession } from '@/app/lib/session';

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

export async function getAllExpenses() {
  try {
    const res = await verifyAdmin();
    if (!res.isAuth || res.error) {
      return { success: false, error: res.error || 'INVALID_ADMIN_SESSION', expenses: null }
    }

    const expenses = await prisma.expense.findMany({
      select: {
        id: true,
        description: true,
        amount: true,
        currency: true,
        date: true,
        groupId: true,
        paidById: true,
        createdAt: true,
        updatedAt: true,
        group: {
          select: {
            name: true
          }
        },
        paidBy: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return { 
      success: true, 
      expenses,
      error: null
    };
  } catch (error) {
    console.error('Error listing expenses:', error);
    return { success: false, error: 'FAILED_TO_FETCH_EXPENSES', expenses: null };
  }
}

export async function getAllExpenseShares() {
  try {
    const res = await verifyAdmin();
    if (!res.isAuth || res.error) {
      return { success: false, error: res.error || 'INVALID_ADMIN_SESSION', shares: null }
    }

    const shares = await prisma.expenseShare.findMany({
      select: {
        id: true,
        expenseId: true,
        userId: true,
        amount: true,
        isPaid: true,
        paidAt: true,
        createdAt: true,
        updatedAt: true,
        expense: {
          select: {
            description: true,
            group: {
              select: {
                name: true
              }
            }
          }
        },
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { 
      success: true, 
      shares,
      error: null
    };
  } catch (error) {
    console.error('Error listing expense shares:', error);
    return { success: false, error: 'FAILED_TO_FETCH_SHARES', shares: null };
  }
}