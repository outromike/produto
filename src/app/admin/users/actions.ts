
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { User, Permissions } from '@/types';
import { revalidatePath } from 'next/cache';

const USERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'users.json');

const getDefaultPermissions = (): Permissions => ({
    schedules: false,
    products: false,
    productManagement: false,
    receiving: false,
    conference: false,
    allocation: false,
    dashboard: false,
    reports: false,
});

const getAdminPermissions = (): Permissions => ({
    schedules: true,
    products: true,
    productManagement: true,
    receiving: true,
    conference: true,
    allocation: true,
    dashboard: true,
    reports: true,
});

export async function getAllUsers(): Promise<User[]> {
    try {
        const jsonData = await fs.readFile(USERS_FILE_PATH, 'utf-8');
        const users: User[] = JSON.parse(jsonData);
        return users.map(user => ({
            ...user,
            permissions: user.permissions || (user.role === 'admin' ? getAdminPermissions() : getDefaultPermissions()),
        }));
    } catch (error) {
        console.error("Error reading users.json:", error);
        return [];
    }
}

async function saveUsers(users: User[]): Promise<void> {
    const data = JSON.stringify(users, null, 2);
    await fs.writeFile(USERS_FILE_PATH, data, 'utf-8');
}

export async function addUser(data: Omit<User, 'permissions'> & { permissions?: Permissions }): Promise<{ success: boolean; error?: string }> {
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
            permissions: data.role === 'admin' ? getAdminPermissions() : (data.permissions || getDefaultPermissions()),
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

export async function updateUser(username: string, data: Partial<Omit<User, 'username'>>): Promise<{ success: boolean; error?: string }> {
    try {
        const users = await getAllUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            return { success: false, error: "Usuário não encontrado." };
        }
        
        const updatePayload = { ...data };
        
        if (updatePayload.password === "") {
            delete updatePayload.password;
        }

        if (updatePayload.role === 'admin') {
            updatePayload.permissions = getAdminPermissions();
        }
        
        users[userIndex] = { ...users[userIndex], ...updatePayload };
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
