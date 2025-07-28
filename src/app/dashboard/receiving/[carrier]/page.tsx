
import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule, ConferenceEntry } from '@/types';
import { ConferenceClient } from '@/components/receiving/conference-client';

async function getSchedulesForCarrier(carrier: string): Promise<ReturnSchedule[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'agendamentos.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        const allSchedules: ReturnSchedule[] = JSON.parse(jsonData);
        
        // Let the client-side handle date filtering for better UX
        return allSchedules.filter(s => 
            s.carrier === carrier
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error) {
        console.error("Error reading agendamentos.json:", error);
        return [];
    }
}

async function getConferencesForSchedules(scheduleNfds: string[]): Promise<ConferenceEntry[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'conferences.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        const allConferences = JSON.parse(jsonData) as ConferenceEntry[];
        const scheduleNfdSet = new Set(scheduleNfds);
        // Returns all conferences whose NFDs are in the carrier's schedules
        return allConferences.filter(c => scheduleNfdSet.has(c.nfd));
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return [];
        }
        console.error("Error reading conferences.json:", error);
        return [];
    }
}

export default async function ConferencePage({ params }: { params: { carrier: string } }) {
    const carrierName = decodeURIComponent(params.carrier);
    const schedules = await getSchedulesForCarrier(carrierName);
    
    const scheduleNfds = schedules.map(s => s.nfd);
    const initialConferences = await getConferencesForSchedules(scheduleNfds);

    return (
        <ConferenceClient 
            initialSchedules={schedules} 
            carrierName={carrierName} 
            initialConferences={initialConferences}
        />
    );
}
