
import { promises as fs } from 'fs';
import path from 'path';
import { ConferenceEntry, ReturnSchedule, StorageEntry } from '@/types';
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
    date: string; // Add date to the summary
    totalNotes: number;
    totalVolume: number;
    schedules: ReturnSchedule[];
    isConferenceCompleted: boolean;
    isAllocationCompleted: boolean;
};

export default async function ReceivingPage() {
    const allSchedules = await getSchedules();
    const allConferences = await getConferences();
    const allProducts = await getProducts();
    const allStorageData = await getStorageData();

    const conferencedNfds = new Set(allConferences.map(c => c.nfd));

    const schedulesByCarrierAndDate = allSchedules.reduce((acc, schedule) => {
        const key = `${schedule.carrier}_${schedule.date}`;
        if (!acc[key]) {
            acc[key] = {
                carrier: schedule.carrier,
                date: schedule.date,
                totalNotes: 0,
                totalVolume: 0,
                schedules: [],
                isConferenceCompleted: false, // Will be calculated next
                isAllocationCompleted: false, // Will be calculated next
            };
        }
        acc[key].schedules.push(schedule);
        acc[key].totalNotes += 1;
        acc[key].totalVolume += schedule.invoiceVolume;
        return acc;
    }, {} as Record<string, CarrierScheduleSummary>);

    // Check for completion status for each summary
    for (const key in schedulesByCarrierAndDate) {
        const summary = schedulesByCarrierAndDate[key];
        const allNfdsForCarrier = summary.schedules.map(s => s.nfd);
        
        // Conference is completed if every scheduled NFD for that carrier on that day has at least one conference entry.
        const isConferenceCompleted = allNfdsForCarrier.every(nfd => conferencedNfds.has(nfd));
        summary.isConferenceCompleted = isConferenceCompleted;

        if (isConferenceCompleted) {
            // Allocation is completed if all items for all related conferences are fully allocated.
            const conferencesForCarrier = allConferences.filter(c => allNfdsForCarrier.includes(c.nfd));
            const totalReceived = conferencesForCarrier.reduce((sum, c) => sum + c.receivedVolume, 0);
            const totalAllocated = conferencesForCarrier.reduce((sum, c) => sum + (c.allocatedVolume || 0), 0);
            summary.isAllocationCompleted = totalAllocated >= totalReceived;
        }
    }

    const carrierSummaries = Object.values(schedulesByCarrierAndDate);

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
