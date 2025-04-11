"use server"

import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { createSession, deleteSession } from "@/app/lib/session";

export async function register(username: string, password: string) {
  if (!username || !password) return { error: "username and password are required" };

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) return { error: "Username already exists" };

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
      // default role should be user
    });
    await createSession(user.id, user.role);
    return { success: "User registered", user: user };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unexpected error occurred" };
  }
}

export async function login(username: string, password: string) {
  if (!username || !password) return { error: "username and password are required" };

  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, password: true, role: true } });
  if (!user) return { error: "Invalid credentials" };
  console.log("LOGIN serverside","user", user);

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return { error: "Invalid credentials" };

  await createSession(user.id, user.role);
  return { success: "Login successful" };
}

export async function logout() {
  await deleteSession();
}