import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  const { pathname } = request.nextUrl;

  // If user is logged in and tries to access login page, redirect to products
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/products', request.url));
  }

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!session && pathname.startsWith('/products')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
