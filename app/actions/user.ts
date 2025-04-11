"use server"

import { verifySession } from "@/app/lib/session";
import { Group } from "@/prisma/generated/client";
import { prisma } from "@/app/lib/prisma";

export type UserWithGroups = {
  username: string;
  groups: {
    group: Group;
  }[];
};

export async function getUserWithGroups() {
  const { id } = await verifySession();
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
  }) as UserWithGroups | null;
  console.log("getUserWithGroups", user);
  return user;
}