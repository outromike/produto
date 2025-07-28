import { Product } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';

export async function getProducts(): Promise<Product[]> {
    const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        const products: Product[] = JSON.parse(jsonData);
        // Ordena os produtos pela descrição em ordem alfabética
        return products.sort((a, b) => a.description.localeCompare(b.description));
    } catch (error) {
        console.error("Error reading products.json:", error);
        return [];
    }
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
    const allProducts = await getProducts();
    return allProducts.find(p => p.sku === sku);
}
