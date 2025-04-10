import { NextResponse } from 'next/server';
import { logout } from '@/app/actions/auth';

export async function GET() {
  await logout();
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
} 