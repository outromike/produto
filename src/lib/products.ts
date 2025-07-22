import { Product } from '@/types';
import productsData from '@/data/products.json';
import { promises as fs } from 'fs';
import path from 'path';

// Path to the products file
const productsPath = path.join(process.cwd(), 'src', 'data', 'products.json');

export async function getProducts(): Promise<Product[]> {
  try {
    const productsFileData = await fs.readFile(productsPath, 'utf-8');
    const products = JSON.parse(productsFileData);
    if (Array.isArray(products)) {
        return products as Product[];
    }
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      // products.json doesn't exist, fall back to default data
      return productsData as Product[];
    }
    console.error("Error reading or parsing products.json:", error);
  }
  
  // Fallback for any other errors or if data is not an array
  return productsData as Product[];
}


export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.sku === sku);
}
