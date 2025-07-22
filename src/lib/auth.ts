import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionPayload, User } from '@/types';
import users from '@/data/users.json';

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'product-lookup-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getSession(): Promise<IronSession<SessionPayload> | null> {
    try {
        const session = await getIronSession<SessionPayload>(cookies(), sessionOptions);
        if (!session.user) {
            return null;
        }
        return session;
    } catch (error) {
        return null;
    }
}

export async function setSession(user: User): Promise<IronSession<SessionPayload>> {
  const session = await getIronSession<SessionPayload>(cookies(), sessionOptions);
  session.user = { username: user.username };
  session.expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await session.save();
  return session;
}

export async function destroySession() {
  const session = await getIronSession<SessionPayload>(cookies(), sessionOptions);
  session.destroy();
}

export function findUserByCredentials(credentials: User): User | undefined {
  return users.find(
    (u) => u.username === credentials.username && u.password === credentials.password
  );
}
