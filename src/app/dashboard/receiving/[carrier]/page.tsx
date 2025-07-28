import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule, ConferenceEntry } from '@/types';
import { isToday, parseISO } from 'date-fns';
import { notFound } from 'next/navigation';
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

export default async function ConferencePage({ params }: { params: { carrier: string } }) {
    const carrierName = decodeURIComponent(params.carrier);
    const schedules = await getSchedulesForCarrier(carrierName);
    const conferences = await getConferences();
    
    // Extrai os NFDs de hoje que já tem pelo menos uma conferência
    const todaySchedulesNfds = new Set(schedules.map(s => s.nfd));
    const conferencedNfds = new Set(
        conferences
            .filter(c => todaySchedulesNfds.has(c.nfd))
            .map(c => c.nfd)
    );

    if (schedules.length === 0) {
        // Isso pode acontecer se o usuário navegar diretamente para uma URL de um transportador sem agendamentos para hoje.
        // Vamos mostrar uma mensagem amigável no cliente em vez de um 404 rígido.
    }

    return (
        <ConferenceClient 
            initialSchedules={schedules} 
            carrierName={carrierName} 
            initialConferencedNfds={Array.from(conferencedNfds)}
        />
    );
}