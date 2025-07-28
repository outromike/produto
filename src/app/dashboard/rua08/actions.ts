
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { StorageEntry } from '@/types';

const STORAGE_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'rua08.json');

async function getStorageData(): Promise<StorageEntry[]> {
    try {
        await fs.access(STORAGE_FILE_PATH);
        const jsonData = await fs.readFile(STORAGE_FILE_PATH, 'utf-8');
        return JSON.parse(jsonData) as StorageEntry[];
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            await fs.writeFile(STORAGE_FILE_PATH, '[]', 'utf-8');
            return [];
        }
        console.error("Error reading rua08.json:", error);
        throw new Error("Não foi possível ler os dados de armazenamento.");
    }
}

async function saveStorageData(entries: StorageEntry[]): Promise<void> {
    const data = JSON.stringify(entries, null, 2);
    await fs.writeFile(STORAGE_FILE_PATH, data, 'utf-8');
}

export async function addStorageEntry(entry: StorageEntry): Promise<{ success: boolean; error?: string; createdEntry?: StorageEntry }> {
    try {
        const allEntries = await getStorageData();
        
        allEntries.push(entry);

        await saveStorageData(allEntries);
        
        return { success: true, createdEntry: entry };

    } catch (error) {
        console.error("Failed to add storage entry:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Não foi possível adicionar a entrada de armazenamento." };
    }
}

export async function deleteStorageEntry(id: string): Promise<{ success: boolean; error?: string }> {
     try {
        const allEntries = await getStorageData();
        const updatedEntries = allEntries.filter(e => e.id !== id);

        if (allEntries.length === updatedEntries.length) {
            return { success: false, error: "Entrada não encontrada para exclusão." };
        }

        await saveStorageData(updatedEntries);
        
        return { success: true };

    } catch (error) {
        console.error("Failed to delete storage entry:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Não foi possível excluir a entrada de armazenamento." };
    }
}
