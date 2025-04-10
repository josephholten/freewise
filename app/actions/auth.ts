"use server"

import { PrismaClient } from "@/generated/prisma_client";
import bcrypt from "bcrypt";
import { createSession, deleteSession } from "@/app/lib/session";

const prisma = new PrismaClient();

export async function register(username: string, password: string) {
  if (!username || !password) return { error: "username and password are required" };

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) return { error: "Username already exists" };

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });
    await createSession(user.id);
    return { success: "User registered" };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unexpected error occurred" };
  }
}

export async function login(username: string, password: string) {
  if (!username || !password) return { error: "username and password are required" };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: "Invalid credentials" };
  console.log("LOGIN serverside","user", user);

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return { error: "Invalid credentials" };

  await createSession(user.id);
  return { success: "Login successful" };
}

export async function logout() {
  await deleteSession();
  return { success: "Logged out" };
}