import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionPayload, User } from '@/types';
import { getDbConnection } from './db';
import { RowDataPacket } from 'mysql2';

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

export async function findUserByCredentials(credentials: User): Promise<User | undefined> {
  const db = await getDbConnection();
  if (!db) {
    // Fallback para users.json se o banco não estiver conectado
    const users: User[] = require('@/data/users.json');
    return users.find(
      (u) => u.username === credentials.username && u.password === credentials.password
    );
  }
  
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [credentials.username, credentials.password]
    );

    if (rows.length > 0) {
      const userRow = rows[0];
      return {
        username: userRow.username,
      };
    }
  } catch (error) {
    console.error("Database query error in findUserByCredentials:", error);
    // Em caso de erro na consulta, pode-se optar por um fallback ou retornar undefined
    return undefined;
  }

  return undefined;
}
