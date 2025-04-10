import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("freewise-session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user"],
};
