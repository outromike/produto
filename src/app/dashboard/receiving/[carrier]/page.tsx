import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule } from '@/types';
import { isToday, parseISO } from 'date-fns';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/products';
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
    const allProducts = await getProducts();

    if (schedules.length === 0) {
        return notFound();
    }

    return (
        <ConferenceClient initialSchedules={schedules} carrierName={carrierName} allProducts={allProducts} />
    );
}
