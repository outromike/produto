
import { promises as fs } from 'fs';
import path from 'path';
import { ConferenceEntry, ReturnSchedule, StorageEntry } from '@/types';
import { isToday, parseISO } from 'date-fns';
import { ReceivingClient } from '@/components/receiving/receiving-client';
import { getProducts } from '@/lib/products';

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

async function getConferences(): Promise<ConferenceEntry[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'conferences.json');
    try {
        await fs.access(filePath);
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData) as ConferenceEntry[];
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            await fs.writeFile(filePath, '[]', 'utf-8');
            return [];
        }
        console.error("Error reading conferences.json:", error);
        return [];
    }
}

async function getStorageData(): Promise<StorageEntry[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'rua08.json');
    try {
        await fs.access(filePath);
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData) as StorageEntry[];
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            return [];
        }
        console.error("Error reading rua08.json:", error);
        return [];
    }
}


export type CarrierScheduleSummary = {
    carrier: string;
    totalNotes: number;
    totalVolume: number;
    schedules: ReturnSchedule[];
    isConferenceCompleted: boolean;
    isAllocationCompleted: boolean;
};

export default async function ReceivingPage() {
    const allSchedules = await getSchedules();
    const allConferences = await getConferences();
    const allProducts = await getProducts(); // For the allocation wizard
    const allStorageData = await getStorageData(); // For the allocation wizard

    const todaySchedules = allSchedules.filter(s => isToday(parseISO(s.date)));
    
    const conferencedNfds = new Set(allConferences.map(c => c.nfd));

    const schedulesByCarrier = todaySchedules.reduce((acc, schedule) => {
        if (!acc[schedule.carrier]) {
            acc[schedule.carrier] = {
                carrier: schedule.carrier,
                totalNotes: 0,
                totalVolume: 0,
                schedules: [],
                isConferenceCompleted: false,
                isAllocationCompleted: false,
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
        const isConferenceCompleted = allNfdsForCarrier.every(nfd => conferencedNfds.has(nfd));
        summary.isConferenceCompleted = isConferenceCompleted;

        if (isConferenceCompleted) {
            const conferencesForCarrier = allConferences.filter(c => allNfdsForCarrier.includes(c.nfd));
            const isAllocationCompleted = conferencesForCarrier.every(c => c.allocatedVolume >= c.receivedVolume);
            summary.isAllocationCompleted = isAllocationCompleted;
        }
    }

    const carrierSummaries = Object.values(schedulesByCarrier);

    return (
        <main className="container mx-auto px-4 py-8 md:px-6">
            <ReceivingClient 
                initialSummaries={carrierSummaries} 
                allProducts={allProducts}
                initialStorageData={allStorageData}
            />
        </main>
    );
}
