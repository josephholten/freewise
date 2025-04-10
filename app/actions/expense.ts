'use server';

import { PrismaClient } from '@/generated/prisma_client';
import { verifySession } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function createExpense(data: {
  groupId: string;
  description: string;
  amount: number;
  currency: string;
}) {
  try {
    const session = await verifySession();
    const userId = session.id;

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