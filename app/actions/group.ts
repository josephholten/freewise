'use server';

import { PrismaClient } from '@/generated/prisma_client';
import { verifySession } from '@/app/lib/dal';

const prisma = new PrismaClient();

export async function createGroup(name: string, description?: string) {
  try {
    const { isAuth, id } = await verifySession();
    if (!isAuth) {
      return { error: 'Unauthorized' };
    }

    if (!name) {
      return { error: 'Group name is required' };
    }

    // Create the group and add the creator as a member in a transaction
    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name,
          description,
        },
      });

      await tx.groupMember.create({
        data: {
          userId: id,
          groupId: newGroup.id,
        },
      });

      return newGroup;
    });

    return { success: true, group };
  } catch (error) {
    console.error('Error creating group:', error);
    return { error: 'Failed to create group' };
  }
} 