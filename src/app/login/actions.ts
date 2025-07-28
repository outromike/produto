
"use server";

import { redirect } from 'next/navigation';
import { setSession, findUserByCredentials, destroySession } from '@/lib/auth';
import { User } from '@/types';

export async function login(credentials: Pick<User, 'username' | 'password'>): Promise<{ success: boolean; user?: User; error?: string }> {
  const user = await findUserByCredentials(credentials);

  if (!user) {
    return { success: false, error: 'Usuário ou senha inválidos.' };
  }
  
  await setSession(user);

  // Return user data (without password) to be stored in the client session
  const { password, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

export async function logout() {
  await destroySession();
  redirect('/login');
}
