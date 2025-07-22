"use server";

import { redirect } from 'next/navigation';
import { setSession, findUserByCredentials, destroySession } from '@/lib/auth';
import { User } from '@/types';

export async function login(credentials: User): Promise<{ error: string } | void> {
  const user = findUserByCredentials(credentials);

  if (!user) {
    return { error: 'Invalid username or password.' };
  }
  
  await setSession(user);
  redirect('/products');
}

export async function logout() {
  await destroySession();
  redirect('/login');
}
