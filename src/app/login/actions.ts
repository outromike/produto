
"use server";

import { redirect } from 'next/navigation';
import { setSession, findUserByCredentials, destroySession } from '@/lib/auth';
import { User } from '@/types';

export async function login(credentials: Pick<User, 'username' | 'password'>): Promise<{ error?: string }> {
  const user = await findUserByCredentials(credentials);

  if (!user) {
    return { error: 'Usuário ou senha inválidos.' };
  }
  
  await setSession(user);
  redirect('/dashboard/products');
}

export async function logout() {
  await destroySession();
  redirect('/login');
}
