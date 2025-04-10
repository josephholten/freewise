'use server';

import { PrismaClient } from '@/generated/prisma_client';
import { verifySession } from '@/app/lib/session';

const prisma = new PrismaClient();

export async function createGroup(name: string, description?: string) {
  try {
    const { id } = await verifySession();

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

export async function getGroup(groupId: string) {
  const { id } = await verifySession();

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!group) {
      return { error: 'Group not found' };
    }
    return { success: true, group };
  } catch (error) {
    console.error('Error fetching group:', error);
    return { error: 'Failed to fetch group' };
  }
}

export async function joinGroup(groupId: string) {
  try {
    const session = await verifySession();
    const userId = session.id;

    // Check if user is already a member
    const existingMembership = await prisma.groupMember.findFirst({
      where: {
        groupId: groupId,
        userId: userId,
      },
    });

    if (existingMembership) {
      return { error: 'You are already a member of this group' };
    }

    // Add user to group
    await prisma.groupMember.create({
      data: {
        userId: userId,
        groupId: groupId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error joining group:', error);
    return { error: 'Failed to join group' };
  }
}