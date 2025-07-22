import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionPayload } from './types';

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'product-lookup-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

async function getSessionFromMiddleware(request: NextRequest) {
    try {
        const session = await getIronSession<SessionPayload>(request.cookies, sessionOptions);
        if (!session.user) {
            return null;
        }
        // Check for session expiration
        if (session.expires && new Date() > new Date(session.expires)) {
            session.destroy();
            return null;
        }
        return session;
    } catch (error) {
        return null;
    }
}


export async function middleware(request: NextRequest) {
  const session = await getSessionFromMiddleware(request);
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
