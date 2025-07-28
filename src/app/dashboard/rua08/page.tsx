
// This page will be responsible for fetching all necessary data and passing it to the client component.

import { Rua08Client } from "@/components/rua08/rua08-client";
import { promises as fs } from "fs";
import path from "path";
import { ConferenceEntry, StorageLocation, ReturnSchedule } from "@/types";

async function getConferences(): Promise<ConferenceEntry[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'conferences.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData) as ConferenceEntry[];
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return [];
        }
        console.error("Error reading conferences.json:", error);
        return [];
    }
}

async function getStorageData(): Promise<StorageLocation[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'rua08.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData) as StorageLocation[];
    } catch (error) {
         if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return [];
        }
        console.error("Error reading rua08.json:", error);
        return [];
    }
}


export default async function Rua08Page() {

    const conferences = await getConferences();
    const storageData = await getStorageData();

    return (
        <main className="container mx-auto px-4 py-8 md:px-6">
            <Rua08Client 
                initialConferences={conferences}
                initialStorageData={storageData}
            />
        </main>
    );
}
