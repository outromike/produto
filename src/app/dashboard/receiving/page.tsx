
import { promises as fs } from 'fs';
import path from 'path';
import { ReturnSchedule } from '@/types';
import { isToday, parseISO } from 'date-fns';
import { ReceivingClient } from '@/components/receiving/receiving-client';

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

export type CarrierScheduleSummary = {
    carrier: string;
    totalNotes: number;
    totalVolume: number;
    schedules: ReturnSchedule[];
};

export default async function ReceivingPage() {
    const allSchedules = await getSchedules();
    const todaySchedules = allSchedules.filter(s => isToday(parseISO(s.date)));

    const schedulesByCarrier = todaySchedules.reduce((acc, schedule) => {
        if (!acc[schedule.carrier]) {
            acc[schedule.carrier] = {
                carrier: schedule.carrier,
                totalNotes: 0,
                totalVolume: 0,
                schedules: []
            };
        }
        acc[schedule.carrier].schedules.push(schedule);
        acc[schedule.carrier].totalNotes += 1;
        acc[schedule.carrier].totalVolume += schedule.invoiceVolume;
        return acc;
    }, {} as Record<string, CarrierScheduleSummary>);

    const carrierSummaries = Object.values(schedulesByCarrier);

    return (
        <main className="container mx-auto px-4 py-8 md:px-6">
            <ReceivingClient summaries={carrierSummaries} />
        </main>
    );
}
