import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule } from '@/types';
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

export default async function ConferencePage({ params }: { params: { carrier: string } }) {
    const carrierName = decodeURIComponent(params.carrier);
    const schedules = await getSchedulesForCarrier(carrierName);
    
    if (schedules.length === 0) {
        // This might happen if the user navigates directly to a URL for a carrier with no schedules for today.
        // We'll show a friendly message on the client instead of a hard 404.
    }

    return (
        <ConferenceClient initialSchedules={schedules} carrierName={carrierName} />
    );
}

