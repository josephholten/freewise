'use server';

import { prisma } from '@/app/lib/prisma';
import { verifySession, verifyAdmin } from '@/app/lib/session';

export async function createGroup(name: string, description?: string) {
  try {
    const res = await verifySession();
    if (!res.isAuth || !res.payload) {
      return { error: res.error || 'INVALID_SESSION', isAuth: false }
    }
    const userId = res.payload.id;

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
          userId,
          groupId: newGroup.id,
        },
      });

      return newGroup;
    });

    return { success: true, group, isAuth: true };
  } catch (error) {
    console.error('Error creating group:', error);
    return { error: 'Failed to create group' };
  }
} 

export async function getGroup(groupId: string) {
  try {
    const res = await verifySession();
    if (!res.isAuth || !res.payload) {
      return { error: res.error || 'INVALID_SESSION', isAuth: false }
    }
    const userId = res.payload.id;

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

    return { success: true, group, isAuth: true };
  } catch (error) {
    console.error('Error fetching group:', error);
    return { error: 'Failed to fetch group' };
  }
}

export async function joinGroup(groupId: string) {
  try {
    const res = await verifySession();
    if (!res.isAuth || !res.payload) {
      return { error: res.error || 'INVALID_SESSION', isAuth: false }
    }
    const userId = res.payload.id;

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

    return { success: true, isAuth: true };
  } catch (error) {
    console.error('Error joining group:', error);
    return { error: 'Failed to join group' };
  }
}

export async function leaveGroup(groupId: string) {
  try {
    const res = await verifySession();
    if (!res.isAuth || !res.payload) {
      return { success: false, error: res.error || 'INVALID_SESSION', isAuth: false }
    }
    const userId = res.payload.id;

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

    return { success: true, isAuth: true };
  } catch (error) {
    console.error('Error leaving group:', error);
    return { success: false, error: 'Failed to leave group' };
  }
}

export async function getAllGroups() {
  try {
    const res = await verifyAdmin();
    if (!res.isAuth || res.error) {
      return { success: false, error: res.error || 'INVALID_ADMIN_SESSION', groups: null }
    }

    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return { 
      success: true, 
      groups,
      error: null
    };
  } catch (error) {
    console.error('Error listing groups:', error);
    return { success: false, error: 'FAILED_TO_FETCH_GROUPS', groups: null };
  }
}

export async function getAllGroupMemberships() {
  try {
    const res = await verifyAdmin();
    if (!res.isAuth || res.error) {
      return { success: false, error: res.error || 'INVALID_ADMIN_SESSION', memberships: null }
    }

    const memberships = await prisma.groupMember.findMany({
      select: {
        id: true,
        userId: true,
        groupId: true,
        joinedAt: true,
        user: {
          select: {
            username: true
          }
        },
        group: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    return { 
      success: true, 
      memberships,
      error: null
    };
  } catch (error) {
    console.error('Error listing group memberships:', error);
    return { success: false, error: 'FAILED_TO_FETCH_MEMBERSHIPS', memberships: null };
  }
}
