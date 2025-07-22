"use server";

import { redirect } from 'next/navigation';
import { setSession, findUserByCredentials, destroySession } from '@/lib/auth';
import { User } from '@/types';

export async function login(credentials: User): Promise<{ error?: string, success?: boolean }> {
  const user = findUserByCredentials(credentials);

  if (!user) {
    return { error: 'Invalid username or password.' };
  }
  
  await setSession(user);
  return { success: true };
}

export async function logout() {
  await destroySession();
  redirect('/login');
}
