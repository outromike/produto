
import { getSession } from "@/lib/auth";
import { StorageEntry } from "@/types";
import { promises as fs } from "fs";
import path from "path";
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { AccessDenied } from "@/components/auth/access-denied";

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

const buildings = [ "111", "109", "107", "105", "103", "101", "99", "97", "95", "93", "91", "89", "87", "85", "83", "81", "79", "77", "75", "73" ];
const TOTAL_POSITIONS = buildings.length * 6; // 20 buildings * 6 levels each

export default async function AnalyticsPage() {
    const session = await getSession();
    if (!session.user?.permissions.dashboard) {
        return <AccessDenied />;
    }

    const storageData = await getStorageData();

    const occupiedPositions = new Set(storageData.map(e => `${e.building}-${e.level}`));
    const occupiedCount = occupiedPositions.size;
    const availableCount = TOTAL_POSITIONS - occupiedCount;
    const occupationRate = TOTAL_POSITIONS > 0 ? (occupiedCount / TOTAL_POSITIONS) * 100 : 0;

    const goodProductsStatuses = ["Produto Bom OK", "Produto Bom SEM BDV", "Produto Bom Ag. Fiscal"];
    const goodProductPositions = new Set(
        storageData
            .filter(e => goodProductsStatuses.includes(e.status))
            .map(e => `${e.building}-${e.level}`)
    );
    const goodProductsCount = goodProductPositions.size;

    const discardStatuses = ["Descarte OK", "Descarte SEM BDV", "Descarte Ag. Fiscal"];
    const discardPositions = new Set(
        storageData
            .filter(e => discardStatuses.includes(e.status))
            .map(e => `${e.building}-${e.level}`)
    );
    const discardCount = discardPositions.size;
    
    const dashboardData = {
        totalPositions: TOTAL_POSITIONS,
        occupiedPositions: occupiedCount,
        availablePositions: availableCount,
        occupationRate: occupationRate,
        goodProductsPositions: goodProductsCount,
        discardPositions: discardCount,
    };

    return <DashboardClient data={dashboardData} />;
}
