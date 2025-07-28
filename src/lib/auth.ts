
'use server';

import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionPayload, User } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long_for_dev',
  cookieName: 'elgin-app-session',
  cookieOptions: {
    secure: false,
  },
};

export async function getSession(): Promise<IronSession<SessionPayload>> {
    const session = await getIronSession<SessionPayload>(cookies(), sessionOptions);
    return session;
}

export async function setSession(user: User): Promise<void> {
  const session = await getSession();
  const { password, ...userWithoutPassword } = user;
  session.user = userWithoutPassword;
  await session.save();
}

export async function destroySession() {
  const session = await getSession();
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
