'use server';

import { prisma } from '@/app/lib/prisma';
import { verifySession } from '@/app/lib/session';

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
  try {
    const session = await verifySession();
    const userId = session.id;

    // First check if the user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: groupId,
        userId: userId,
      },
    });

    if (!membership) {
      return { error: 'You are not a member of this group' };
    }

    // Fetch the group with its members and expenses
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        expenses: {
          include: {
            paidBy: {
              select: {
                username: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
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

export async function leaveGroup(groupId: string) {
  try {
    const session = await verifySession();
    const userId = session.id;

    // Delete the membership
    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId,
        },
      },
    });

    // if last member, delete group
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        members: true,
      },
    });

    if (group?.members.length && group.members.length <= 1) {
      await prisma.group.delete({
        where: {
          id: groupId,
        },
      });
      console.log('Group', groupId, 'deleted');
    }

    // delete all expenses
    await prisma.expense.deleteMany({
      where: {
        groupId: groupId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error leaving group:', error);
    return { error: 'Failed to leave group' };
  }
}