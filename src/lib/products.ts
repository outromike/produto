import { Product } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

// Path to your products.json file
const productsFilePath = path.join(process.cwd(), 'src/data/products.json');

async function readProductsFile(): Promise<Product[]> {
  try {
    const fileContent = await fs.readFile(productsFilePath, 'utf8');
    // If the file is empty or just has empty array brackets, return empty
    if (!fileContent || fileContent.trim() === '[]') {
      return [];
    }
    return JSON.parse(fileContent);
  } catch (error: any) {
    // If the file doesn't exist, it's not an error, just means no products yet.
    if (error.code === 'ENOENT') {
      return [];
    }
    // For other errors (like invalid JSON), log it and return empty.
    console.error('Error reading products.json:', error);
    return [];
  }
}


export async function getProducts(): Promise<Product[]> {
  const products = await readProductsFile();
  return products;
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.sku === sku);
}
