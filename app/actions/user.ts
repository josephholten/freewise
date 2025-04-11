"use server"

import { verifyAdmin, verifySession } from "@/app/lib/session";
import { Group } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

export type UserWithGroups = {
  username: string;
  groups: {
    group: Group;
  }[];
};

export async function getUserWithGroups() {
  const res = await verifySession();
  if (!res.isAuth || !res.payload || res.error || !res.payload.id) {
    return { success: false, error: res.error || 'INVALID_SESSION', isAuth: false, user: null }
  }
  const { id } = res.payload;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { 
      username: true,
      groups: {
        include: {
          group: true
        }
      }
    }
  }) as UserWithGroups;
  if (!user) {
    return { success: false, error: 'USER_NOT_FOUND', isAuth: true, user: null }
  }
  return { success: true, user, isAuth: true, error: null };
}

export async function getAllUsers() {
  try {
    const res = await verifyAdmin();
    if (!res.isAuth || res.error) {
      return { success: false, error: res.error || 'INVALID_ADMIN_SESSION', users: null }
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        defaultCurrency: true
      },
      orderBy: {
        username: 'asc'
      }
    });

    return { 
      success: true, 
      users,
      error: null
    };
  } catch (error) {
    console.error('Error listing users:', error);
    return { success: false, error: 'FAILED_TO_FETCH_USERS', users: null };
  }
}