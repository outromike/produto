
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { AllocationEntry, ConferenceEntry, StorageEntry } from '@/types';

const STORAGE_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'rua08.json');
const CONFERENCES_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'conferences.json');

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


async function getConferences(): Promise<ConferenceEntry[]> {
    try {
        await fs.access(CONFERENCES_FILE_PATH);
        const jsonData = await fs.readFile(CONFERENCES_FILE_PATH, 'utf-8');
        return JSON.parse(jsonData) as ConferenceEntry[];
    } catch (error) {
        return [];
    }
}

async function saveConferences(conferences: ConferenceEntry[]): Promise<void> {
    const data = JSON.stringify(conferences, null, 2);
    await fs.writeFile(CONFERENCES_FILE_PATH, data, 'utf-8');
}


export async function allocateProducts(allocations: AllocationEntry[]): Promise<{ success: boolean; error?: string }> {
    if (!allocations || allocations.length === 0) {
        return { success: false, error: "Nenhum produto para alocar." };
    }
    
    try {
        const [allStorage, allConferences] = await Promise.all([
            getStorageData(),
            getConferences()
        ]);
        
        const newStorageEntries: StorageEntry[] = [];
        const conferenceUpdateMap = new Map<string, number>(); // conferenceId -> newAllocatedVolume

        for (const alloc of allocations) {
            newStorageEntries.push({
                id: `${Date.now()}-${Math.random()}`,
                building: alloc.building,
                level: alloc.level,
                nfd: alloc.nfd,
                salesNote: alloc.salesNote,
                shipment: alloc.shipment,
                productSku: alloc.productSku,
                productDescription: alloc.productDescription,
                quantity: alloc.quantity,
                status: alloc.status,
                allocatedAt: new Date().toISOString(),
            });
            
            const currentAllocated = conferenceUpdateMap.get(alloc.conferenceId) || 0;
            conferenceUpdateMap.set(alloc.conferenceId, currentAllocated + alloc.quantity);
        }

        // Update conferences with new allocated volumes
        const updatedConferences = allConferences.map(conf => {
            if(conferenceUpdateMap.has(conf.id)) {
                const newAllocation = conferenceUpdateMap.get(conf.id)!;
                return {
                    ...conf,
                    allocatedVolume: (conf.allocatedVolume || 0) + newAllocation
                };
            }
            return conf;
        });

        // Save both files
        await Promise.all([
            saveStorageData([...allStorage, ...newStorageEntries]),
            saveConferences(updatedConferences)
        ]);

        return { success: true };

    } catch (error) {
        console.error("Failed to allocate products:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Não foi possível alocar os produtos." };
    }
}

export async function addStorageEntry(entry: StorageEntry): Promise<{ success: boolean; error?: string; createdEntry?: StorageEntry }> {
    try {
        const allEntries = await getStorageData();
        allEntries.push(entry);
        await saveStorageData(allEntries);
        return { success: true, createdEntry: entry };
    } catch(error) {
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
