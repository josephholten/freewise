import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

export function middleware(req: NextRequest) {
  console.log('Middleware running for path:', req.nextUrl.pathname);
  const token = req.cookies.get("freewise-jwt")?.value;
  console.log('Cookie value:', token ? 'exists' : 'not found');

  if (!token) {
    console.log('No token found, redirecting to login');
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    jwtVerify(token, encodedKey);
    console.log('Token verified successfully');
    return NextResponse.next();
  } catch (error) {
    console.log('Token verification failed:', error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/user"],
};
