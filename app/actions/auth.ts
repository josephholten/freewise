"use server"

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function register(username: string, password: string) {
  if (!username || !password) return { error: "username and password are required" };

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    await prisma.user.create({
      data: { username, password: hashedPassword },
    });
    return { success: "User registered" };
  } catch {
    return { error: "User already exists" };
  }
}

export async function login(username: string, password: string) {
  if (!username || !password) return { error: "username and password are required" };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: "Invalid credentials" };

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return { error: "Invalid credentials" };

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const c = await cookies();
  c.set("token", token, { httpOnly: true, secure: true, path: "/" });

  return { success: "Login successful" };
}

export async function logout() {
  const c = await cookies();
  c.set("token", "", { httpOnly: true, secure: true, path: "/", maxAge: 0 });
  return { success: "Logged out" };
}