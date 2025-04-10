"use server"

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

export async function register(username: string, password: string) {
  if (!username || !password) return { error: "username and password are required" };

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) return { error: "Username already exists" };

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    await prisma.user.create({
      data: { username, password: hashedPassword },
    });
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

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return { error: "Invalid credentials" };

  const token = await new SignJWT(
    { UserId: user.id, username: user.username },
  )
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .setIssuedAt()
    .sign(encodedKey);

  console.log('Setting cookie with token:', token);
  const cookieStore = await cookies();
  cookieStore.set(
    "freewise-jwt", token, 
    {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: 'lax'
    }
  );
  console.log('Cookie set successfully');

  return { success: "Login successful" };
}

export async function logout() {
  const c = await cookies();
  c.set("freewise-jwt", "", { httpOnly: true, secure: false, path: "/", maxAge: 0 });
  return { success: "Logged out" };
}