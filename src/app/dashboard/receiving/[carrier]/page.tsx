import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule, ConferenceEntry } from '@/types';
import { isToday, parseISO } from 'date-fns';
import { ConferenceClient } from '@/components/receiving/conference-client';

async function getSchedulesForCarrier(carrier: string): Promise<ReturnSchedule[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'agendamentos.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        const allSchedules: ReturnSchedule[] = JSON.parse(jsonData);
        
        return allSchedules.filter(s => 
            s.carrier === carrier && isToday(parseISO(s.date))
        ).sort((a,b) => a.nfd.localeCompare(b.nfd));

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
        // Retorna todas as conferências cujas NFDs estão nos agendamentos de hoje
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
    
    // Mostra uma mensagem amigável no cliente se não houver agendamentos.
    if (schedules.length === 0) {
       // O ConferenceClient tratará o caso de `initialSchedules` ser um array vazio.
    }
    
    const todaySchedulesNfds = schedules.map(s => s.nfd);
    const initialConferences = await getConferencesForSchedules(todaySchedulesNfds);

    return (
        <ConferenceClient 
            initialSchedules={schedules} 
            carrierName={carrierName} 
            initialConferences={initialConferences}
        />
    );
}
