
import { promises as fs } from 'fs';
import path from 'path';
import { ConferenceEntry, ReturnSchedule } from '@/types';
import { SchedulesClient } from '@/components/schedules/schedules-client';

async function getSchedules(): Promise<ReturnSchedule[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'agendamentos.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData) as ReturnSchedule[];
    } catch (error) {
        console.error("Error reading agendamentos.json:", error);
        return [];
    }
}

async function getConferencedNfds(): Promise<Set<string>> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'conferences.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        const conferences = JSON.parse(jsonData) as ConferenceEntry[];
        const conferencedNfds = new Set(conferences.map(c => c.nfd));
        return conferencedNfds;
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return new Set();
        }
        console.error("Error reading conferences.json:", error);
        return new Set();
    }
}

export default async function SchedulesPage() {
    const schedules = await getSchedules();
    const conferencedNfds = await getConferencedNfds();
    
    return (
        <main className="container mx-auto px-4 py-8 md:px-6">
           <SchedulesClient 
                initialSchedules={schedules} 
                initialConferencedNfds={Array.from(conferencedNfds)} 
           />
        </main>
    );
}

