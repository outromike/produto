
// src/app/dashboard/rua08/page.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import { Product, StorageEntry } from "@/types";
import { getProducts } from "@/lib/products";
import { StorageManager } from "@/components/rua08/storage-manager";

async function getStorageData(): Promise<StorageEntry[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'rua08.json');
    try {
        await fs.access(filePath);
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData) as StorageEntry[];
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
            // Se o arquivo não existe, cria um array vazio.
            await fs.writeFile(filePath, '[]', 'utf-8');
            return [];
        }
        console.error("Error reading rua08.json:", error);
        return [];
    }
}

export default async function Rua08Page() {
    const session = await getSession();
    if (!session.user?.permissions.allocation) {
        redirect('/dashboard');
    }

    const products = await getProducts();
    const storageData = await getStorageData();

    return (
        <main className="container mx-auto px-4 py-8 md:px-6">
            <StorageManager 
                initialProducts={products}
                initialStorageData={storageData}
            />
        </main>
    );
}
