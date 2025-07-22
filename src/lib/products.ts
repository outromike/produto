import { Product } from '@/types';
import productsData from '@/data/products.json';
import fs from 'fs';
import path from 'path';

// Path to the products file
const productsPath = path.join(process.cwd(), 'src', 'data', 'products.json');

export async function getProducts(): Promise<Product[]> {
  // Check if the products file exists
  if (fs.existsSync(productsPath)) {
    try {
      const productsFileData = fs.readFileSync(productsPath, 'utf-8');
      const products = JSON.parse(productsFileData);
      if (Array.isArray(products)) {
        return products as Product[];
      }
    } catch (error) {
      console.error("Error reading or parsing products.json:", error);
      // Fallback to default products if there's an error - this should not happen in normal operation
    }
  }
  
  // This will be used only if the products.json file is missing or corrupted.
  return productsData as Product[];
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.sku === sku);
}
