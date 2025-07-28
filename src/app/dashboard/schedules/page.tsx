
import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule } from '@/types';
import { SchedulesClient } from '@/components/schedules/schedules-client';

async function getSchedules(): Promise<ReturnSchedule[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'agendamentos.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        const schedules: ReturnSchedule[] = JSON.parse(jsonData);
        // Sort by date, most recent first
        return schedules.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("Error reading agendamentos.json:", error);
        return [];
    }
}


export default async function SchedulesPage() {
    const schedules = await getSchedules();
    
    return (
        <main className="container mx-auto px-4 py-8 md:px-6">
           <SchedulesClient initialSchedules={schedules} />
        </main>
    );
}
