"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { ConferenceEntry, Product } from '@/types';
import { getProducts } from '@/lib/products';

const CONFERENCES_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'conferences.json');

async function getConferences(): Promise<ConferenceEntry[]> {
    try {
        await fs.access(CONFERENCES_FILE_PATH);
        const jsonData = await fs.readFile(CONFERENCES_FILE_PATH, 'utf-8');
        return JSON.parse(jsonData) as ConferenceEntry[];
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            await fs.writeFile(CONFERENCES_FILE_PATH, '[]', 'utf-8');
            return [];
        }
        console.error("Error reading conferences.json:", error);
        throw new Error("Não foi possível ler as conferências.");
    }
}

async function saveConferences(conferences: ConferenceEntry[]): Promise<void> {
    const data = JSON.stringify(conferences, null, 2);
    await fs.writeFile(CONFERENCES_FILE_PATH, data, 'utf-8');
}

export async function saveConference(data: ConferenceEntry): Promise<{ success: boolean; error?: string; savedConference?: ConferenceEntry }> {
    try {
        const allConferences = await getConferences();
        const existingIndex = allConferences.findIndex(c => c.id === data.id);

        let savedConference: ConferenceEntry;

        if (existingIndex > -1) {
            // Update existing conference
            allConferences[existingIndex] = { ...allConferences[existingIndex], ...data, conferenceTimestamp: new Date().toISOString() };
            savedConference = allConferences[existingIndex];
        } else {
            // Add new conference
            savedConference = data;
            allConferences.push(savedConference);
        }

        await saveConferences(allConferences);
        
        return { success: true, savedConference };
    } catch (error) {
        console.error("Failed to save conference:", error);
        return { success: false, error: "Não foi possível salvar a conferência." };
    }
}


export async function findProduct(query: string): Promise<Product[]> {
    if (!query) return [];
    const products = await getProducts();
    const lowerCaseQuery = query.toLowerCase();
    
    return products.filter(p => 
        p.sku.toLowerCase().includes(lowerCaseQuery) ||
        p.item.toLowerCase().includes(lowerCaseQuery) ||
        p.description.toLowerCase().includes(lowerCaseQuery)
    ).slice(0, 10); // Limita a 10 resultados para performance
}
