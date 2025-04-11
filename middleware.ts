import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/app/lib/session";

const publicRoutes = ["/login", "/register", "/invite/:groupId"]
const protectedRoutes = ["/user", "/group/:groupId"]
const adminRoutes = ["/admin"]

export async function middleware(req: NextRequest) {
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!protectedRoutes.includes(req.nextUrl.pathname) && adminRoutes.includes(req.nextUrl.pathname)) {
    console.log("error: unclassified route", req.nextUrl.pathname);
    return NextResponse.redirect(new URL("/", req.url));
  }

  const res = await verifySession();

  if (!res.isAuth || !res.payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (adminRoutes.includes(req.nextUrl.pathname) && res.payload.role !== "admin") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user"],
};
