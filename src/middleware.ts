
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!session?.user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in and tries to access a public route, redirect to dashboard
  if (session?.user && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard/products', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
