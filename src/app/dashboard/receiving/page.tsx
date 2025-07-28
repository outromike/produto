
import { promises as fs } from 'fs';
import path from 'path';
import { ConferenceEntry, ReturnSchedule } from '@/types';
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

export type CarrierScheduleSummary = {
    carrier: string;
    totalNotes: number;
    totalVolume: number;
    schedules: ReturnSchedule[];
    isCompleted: boolean;
};

export default async function ReceivingPage() {
    const allSchedules = await getSchedules();
    const conferencedNfds = await getConferencedNfds();
    const todaySchedules = allSchedules.filter(s => isToday(parseISO(s.date)));

    const schedulesByCarrier = todaySchedules.reduce((acc, schedule) => {
        if (!acc[schedule.carrier]) {
            acc[schedule.carrier] = {
                carrier: schedule.carrier,
                totalNotes: 0,
                totalVolume: 0,
                schedules: [],
                isCompleted: false, // Initialize as false
            };
        }
        acc[schedule.carrier].schedules.push(schedule);
        acc[schedule.carrier].totalNotes += 1;
        acc[schedule.carrier].totalVolume += schedule.invoiceVolume;
        return acc;
    }, {} as Record<string, CarrierScheduleSummary>);

    // Check for completion status
    for (const carrier in schedulesByCarrier) {
        const summary = schedulesByCarrier[carrier];
        const allNfdsForCarrier = summary.schedules.map(s => s.nfd);
        const isCompleted = allNfdsForCarrier.every(nfd => conferencedNfds.has(nfd));
        summary.isCompleted = isCompleted;
    }

    const carrierSummaries = Object.values(schedulesByCarrier);

    return (
        <main className="container mx-auto px-4 py-8 md:px-6">
            <ReceivingClient summaries={carrierSummaries} />
        </main>
    );
}
