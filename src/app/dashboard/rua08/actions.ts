
"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { StorageLocation, StorageEntry } from '@/types';

const STORAGE_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'rua08.json');

async function getStorageData(): Promise<StorageLocation[]> {
    try {
        await fs.access(STORAGE_FILE_PATH);
        const jsonData = await fs.readFile(STORAGE_FILE_PATH, 'utf-8');
        return JSON.parse(jsonData) as StorageLocation[];
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            await fs.writeFile(STORAGE_FILE_PATH, '[]', 'utf-8');
            return [];
        }
        console.error("Error reading rua08.json:", error);
        throw new Error("Não foi possível ler os dados de armazenamento.");
    }
}

async function saveStorageData(locations: StorageLocation[]): Promise<void> {
    const data = JSON.stringify(locations, null, 2);
    await fs.writeFile(STORAGE_FILE_PATH, data, 'utf-8');
}

export async function allocateProducts(locationId: string, entries: StorageEntry[]): Promise<{ success: boolean; error?: string, updatedLocation?: StorageLocation }> {
    try {
        const allLocations = await getStorageData();
        let location = allLocations.find(l => l.id === locationId);

        if (!location) {
            // Create a new location if it doesn't exist
            location = {
                id: locationId,
                entries: [],
                status: 'empty', 
                capacity: 1 // Default capacity, can be changed later
            };
            allLocations.push(location);
        }
        
        // Add new entries, overwriting existing ones for the same product SKU and NFD for simplicity
        entries.forEach(newEntry => {
            const existingIndex = location!.entries.findIndex(
                e => e.productSku === newEntry.productSku && e.nfd === newEntry.nfd
            );
            if (existingIndex > -1) {
                location!.entries[existingIndex] = newEntry;
            } else {
                location!.entries.push(newEntry);
            }
        });
        
        // Update status - simple logic for now
        location.status = location.entries.length > 0 ? 'partial' : 'empty';

        await saveStorageData(allLocations);
        
        return { success: true, updatedLocation: location };

    } catch (error) {
        console.error("Failed to allocate products:", error);
        return { success: false, error: "Não foi possível alocar os produtos." };
    }
}

export async function clearLocation(locationId: string): Promise<{ success: boolean; error?: string }> {
     try {
        const allLocations = await getStorageData();
        const locationIndex = allLocations.findIndex(l => l.id === locationId);

        if (locationIndex === -1) {
            return { success: false, error: "Localização não encontrada." };
        }

        allLocations[locationIndex].entries = [];
        allLocations[locationIndex].status = 'empty';

        await saveStorageData(allLocations);
        
        return { success: true };

    } catch (error) {
        console.error("Failed to clear location:", error);
        return { success: false, error: "Não foi possível limpar a localização." };
    }
}
