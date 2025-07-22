import { Product } from '@/types';
import productsData from '@/data/products.json';
import fs from 'fs';
import path from 'path';

// Path to the uploaded products file
const uploadedProductsPath = path.join(process.cwd(), 'src', 'data', 'products1.json');

export async function getProducts(): Promise<Product[]> {
  // Check if the uploaded products file exists
  if (fs.existsSync(uploadedProductsPath)) {
    try {
      const uploadedProductsData = fs.readFileSync(uploadedProductsPath, 'utf-8');
      const uploadedProducts = JSON.parse(uploadedProductsData);
      if (Array.isArray(uploadedProducts)) {
        return uploadedProducts as Product[];
      }
    } catch (error) {
      console.error("Error reading or parsing products1.json:", error);
      // Fallback to default products if there's an error
    }
  }
  
  // Fallback to the default products.json
  return productsData as Product[];
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.sku === sku);
}
