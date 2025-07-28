
import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule, ConferenceEntry, StorageEntry } from '@/types';
import { ReportsClient } from '@/components/reports/reports-client';

async function getSchedules(): Promise<ReturnSchedule[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'agendamentos.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Error reading agendamentos.json:", error);
        return [];
    }
}

async function getConferences(): Promise<ConferenceEntry[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'conferences.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Error reading conferences.json:", error);
        return [];
    }
}

async function getStorageData(): Promise<StorageEntry[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'rua08.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Error reading rua08.json:", error);
        return [];
    }
}


export default async function ReportsPage() {
    const [schedules, conferences, storageData] = await Promise.all([
        getSchedules(),
        getConferences(),
        getStorageData()
    ]);

    return (
        <main className="container mx-auto px-4 py-8 md:px-6">
            <ReportsClient 
                schedules={schedules}
                conferences={conferences}
                storageData={storageData}
            />
        </main>
    );
}
