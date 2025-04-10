"use server"

import { verifySession } from "@/app/lib/session";
import { Group, PrismaClient } from "@/generated/prisma_client";

export type UserWithGroups = {
  username: string;
  groups: {
    group: Group;
  }[];
};

export async function getUserWithGroups() {
  const { id } = await verifySession();
  const prisma = new PrismaClient();
  const user =await prisma.user.findUnique({
    where: { id },
    select: { 
      username: true,
      groups: {
        include: {
          group: true
        }
      }
    }
  }) as UserWithGroups | null;
  console.log("getUserWithGroups", user);
  return user;
}