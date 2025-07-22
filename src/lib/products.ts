import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types';

// This is the key change: `unstable_noStore` forces dynamic rendering
// and ensures the CSV files are re-read on every request.
import { unstable_noStore as noStore } from 'next/cache';


function parseCSV(csv: string): Omit<Product, 'unit'>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return []; // Return empty if no data rows
  
  // Use a case-insensitive trim for headers
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
  
  const EAN_HEADER_INDEX = headers.indexOf('ean');
  const SKU_HEADER_INDEX = headers.indexOf('sku');
  const DESCRICAO_HEADER_INDEX = headers.indexOf('descricao');
  const CATEGORIA_HEADER_INDEX = headers.indexOf('categoria');
  const PESO_KG_HEADER_INDEX = headers.indexOf('peso_kg');
  const VOLUME_M3_HEADER_INDEX = headers.indexOf('volume_m3');
  const DIMENSOES_CM_HEADER_INDEX = headers.indexOf('dimensoes_cm');
  const EMBALAGEM_HEADER_INDEX = headers.indexOf('embalagem');
  const CURVA_ABC_HEADER_INDEX = headers.indexOf('curva_abc');

  return lines.slice(1).map((line) => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    return {
      sku: values[SKU_HEADER_INDEX],
      description: values[DESCRICAO_HEADER_INDEX],
      category: values[CATEGORIA_HEADER_INDEX],
      weight: parseFloat(values[PESO_KG_HEADER_INDEX]),
      volume: parseFloat(values[VOLUME_M3_HEADER_INDEX]),
      dimensions: values[DIMENSOES_CM_HEADER_INDEX],
      barcode: values[EAN_HEADER_INDEX],
      packaging: values[EMBALAGEM_HEADER_INDEX] as 'UNIDADE' | 'MASTER',
      classification: values[CURVA_ABC_HEADER_INDEX] as 'A' | 'B' | 'C',
    };
  }).filter(p => p.sku && p.sku.length > 0); // Filter out rows that might be empty or invalid
}

async function loadProductsForUnit(unit: 'ITJ' | 'JVL'): Promise<Product[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', `Cad_${unit}.csv`);
  try {
    const csvData = await fs.readFile(filePath, 'utf-8');
    const parsedData = parseCSV(csvData);
    return parsedData.map((p) => ({ ...p, unit }));
  } catch (error) {
    // If the file doesn't exist, which is possible before the first upload,
    // we return an empty array to avoid crashing the app.
    console.warn(`Warning: Could not load file for unit ${unit}. It may not exist yet. Error: ${error}`);
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  // By calling noStore(), we ensure this function's result is never cached.
  // It will run on every request, re-reading the CSV files from disk.
  noStore();
  
  const [itjProducts, jvlProducts] = await Promise.all([
    loadProductsForUnit('ITJ'),
    loadProductsForUnit('JVL'),
  ]);

  const allProducts = [...itjProducts, ...jvlProducts];
  return allProducts;
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  // noStore() is called in getProducts(), so we don't need it here again.
  const products = await getProducts();
  return products.find((p) => p.sku === sku);
}
