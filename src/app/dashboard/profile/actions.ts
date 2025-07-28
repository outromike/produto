
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { User } from '@/types';
import { getSession, setSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const USERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'users.json');

async function getUsers(): Promise<User[]> {
    try {
        const jsonData = await fs.readFile(USERS_FILE_PATH, 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Error reading users.json:", error);
        return [];
    }
}

async function saveUsers(users: User[]): Promise<void> {
    const data = JSON.stringify(users, null, 2);
    await fs.writeFile(USERS_FILE_PATH, data, 'utf-8');
}

export async function updateUserInfo(username: string, data: { name: string; email: string; }): Promise<{ success: boolean; error?: string }> {
    try {
        const users = await getUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            return { success: false, error: "Usuário não encontrado." };
        }

        // Update user info in the array
        users[userIndex] = { ...users[userIndex], ...data };
        await saveUsers(users);

        // Update the session with the new user info
        const session = await getSession();
        if (session.user && session.user.username === username) {
            session.user.name = data.name;
            session.user.email = data.email;
            await session.save();
        }

        revalidatePath('/dashboard/profile');
        
        return { success: true };

    } catch (error) {
        console.error("Failed to update user info:", error);
        return { success: false, error: "Falha ao atualizar informações." };
    }
}


export async function changePassword(username: string, data: { currentPassword: string; newPassword: string; }): Promise<{ success: boolean; error?: string }> {
    try {
        const users = await getUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            return { success: false, error: "Usuário não encontrado." };
        }

        const user = users[userIndex];
        if (user.password !== data.currentPassword) {
            return { success: false, error: "A senha atual está incorreta." };
        }

        users[userIndex].password = data.newPassword;
        await saveUsers(users);

        return { success: true };

    } catch (error) {
        console.error("Failed to change password:", error);
        return { success: false, error: "Falha ao alterar a senha." };
    }
}
