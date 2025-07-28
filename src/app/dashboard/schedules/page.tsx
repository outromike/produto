
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

type ConferenceData = {
    conferencedNfds: Set<string>;
    rejectedNfds: Set<string>;
    nfdReceivedVolumes: { [key: string]: number };
};

async function getConferenceData(): Promise<ConferenceData> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'conferences.json');
    const conferencedNfds = new Set<string>();
    const rejectedNfds = new Set<string>();
    const nfdReceivedVolumes: { [key: string]: number } = {};
    
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        const conferences = JSON.parse(jsonData) as ConferenceEntry[];
        
        for (const c of conferences) {
            conferencedNfds.add(c.nfd);
            if (c.productState === 'Recusa Total') {
                rejectedNfds.add(c.nfd);
            }
            // Sum up received volumes per NFD
            nfdReceivedVolumes[c.nfd] = (nfdReceivedVolumes[c.nfd] || 0) + c.receivedVolume;
        }
        return { conferencedNfds, rejectedNfds, nfdReceivedVolumes };

    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
             return { conferencedNfds, rejectedNfds, nfdReceivedVolumes };
        }
        console.error("Error reading conferences.json:", error);
        return { conferencedNfds, rejectedNfds, nfdReceivedVolumes };
    }
}

export default async function SchedulesPage() {
    const schedules = await getSchedules();
    const { conferencedNfds, rejectedNfds, nfdReceivedVolumes } = await getConferenceData();
    
    return (
        <main className="flex-1 p-4 sm:p-6 md:p-8">
           <SchedulesClient 
                initialSchedules={schedules} 
                initialConferencedNfds={Array.from(conferencedNfds)} 
                initialRejectedNfds={Array.from(rejectedNfds)}
                initialNfdReceivedVolumes={nfdReceivedVolumes}
           />
        </main>
    );
}
