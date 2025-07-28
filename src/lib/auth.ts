
'use server';

import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionPayload, User } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'product-lookup-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getSession(): Promise<IronSession<SessionPayload>> {
    const session = await getIronSession<SessionPayload>(cookies(), sessionOptions);
    return session;
}

// This is a server action that can be called from client components.
export async function getSessionData(): Promise<IronSession<SessionPayload> | null> {
    const session = await getSession();
    if (!session.user) {
        return null;
    }
    return session;
}


export async function setSession(user: User): Promise<IronSession<SessionPayload>> {
  const session = await getIronSession<SessionPayload>(cookies(), sessionOptions);
  session.user = { username: user.username, role: user.role };
  session.expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await session.save();
  return session;
}

export async function destroySession() {
  const session = await getIronSession<SessionPayload>(cookies(), sessionOptions);
  session.destroy();
}

async function getUsers(): Promise<User[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'users.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Error reading users.json:", error);
        return [];
    }
}

export async function findUserByCredentials(credentials: Pick<User, 'username' | 'password'>): Promise<User | undefined> {
    const users = await getUsers();
    return users.find(
      (u) => u.username === credentials.username && u.password === credentials.password
    );
}

export async function verifyAdminPassword(password: string): Promise<{ success: boolean }> {
    const correctPassword = process.env.ADMIN_ACCESS_PASSWORD;
    if (password === correctPassword) {
        return { success: true };
    }
    return { success: false };
}

