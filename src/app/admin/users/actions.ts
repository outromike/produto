
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { User } from '@/types';
import { revalidatePath } from 'next/cache';

const USERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'users.json');

export async function getAllUsers(): Promise<User[]> {
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

export async function addUser(data: Omit<User, 'role'> & { role: 'admin' | 'user' }): Promise<{ success: boolean; error?: string }> {
    try {
        const users = await getAllUsers();
        
        const existingUser = users.find(u => u.username === data.username);
        if (existingUser) {
            return { success: false, error: "Este nome de usuário já existe." };
        }

        const newUser: User = {
            username: data.username,
            password: data.password,
            name: data.name || "",
            email: data.email || "",
            role: data.role,
        };

        users.push(newUser);
        await saveUsers(users);
        
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Failed to add user:", error);
        return { success: false, error: "Falha ao adicionar novo usuário." };
    }
}

export async function updateUser(username: string, data: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
        const users = await getAllUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            return { success: false, error: "Usuário não encontrado." };
        }
        
        // Remove 'password' from data if it's empty to avoid overwriting with a blank password
        if (data.password === "") {
            delete data.password;
        }
        
        users[userIndex] = { ...users[userIndex], ...data };
        await saveUsers(users);

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Failed to update user:", error);
        return { success: false, error: "Falha ao atualizar o usuário." };
    }
}

export async function deleteUser(username: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (username === 'admin') {
            return { success: false, error: "A conta de administrador não pode ser excluída." };
        }
        
        const users = await getAllUsers();
        const updatedUsers = users.filter(u => u.username !== username);

        if (users.length === updatedUsers.length) {
            return { success: false, error: "Usuário não encontrado." };
        }

        await saveUsers(updatedUsers);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, error: "Falha ao excluir o usuário." };
    }
}
