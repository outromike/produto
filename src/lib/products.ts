
import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types';

// This is the key change: `unstable_noStore` forces dynamic rendering
// and ensures the CSV files are re-read on every request.
import { unstable_noStore as noStore } from 'next/cache';


function parseCSV(csv: string): Omit<Product, 'unit'>[] {
  const lines = csv.trim().replace(/\r/g, "").split('\n');
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, '').toLowerCase());

  const findHeaderIndex = (possibleNames: string[]) => {
    for (const name of possibleNames) {
      const index = headers.indexOf(name.toLowerCase());
      if (index !== -1) return index;
    }
    return -1;
  };

  const SKU_HEADER_INDEX = findHeaderIndex(['sku', 'cód.', 'codigo', 'código']);
  const DESCRICAO_HEADER_INDEX = findHeaderIndex(['descricao', 'descrição', 'description', 'nome']);
  const CATEGORIA_HEADER_INDEX = findHeaderIndex(['categoria', 'category']);
  const PESO_KG_HEADER_INDEX = findHeaderIndex(['peso_kg', 'peso', 'weight']);
  const VOLUME_M3_HEADER_INDEX = findHeaderIndex(['volume_m3', 'volume']);
  const DIMENSOES_CM_HEADER_INDEX = findHeaderIndex(['dimensoes_cm', 'dimensões', 'dimensions']);
  const EAN_HEADER_INDEX = findHeaderIndex(['ean', 'barcode', 'cód. barras']);
  const EMBALAGEM_HEADER_INDEX = findHeaderIndex(['embalagem', 'packaging']);
  const CURVA_ABC_HEADER_INDEX = findHeaderIndex(['curva_abc', 'classification', 'class', 'curva']);

  // If essential headers are missing, we can't process the file.
  if (SKU_HEADER_INDEX === -1 || DESCRICAO_HEADER_INDEX === -1) {
    console.error(`CSV parsing failed: Missing required headers (SKU or Description). Found headers: [${headers.join(', ')}]`);
    return [];
  }

  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
    
    const getSafeValue = (index: number) => values[index] || '';
    const getSafeFloat = (index: number) => parseFloat((values[index] || '0').replace(',', '.')) || 0;

    return {
      sku: getSafeValue(SKU_HEADER_INDEX),
      description: getSafeValue(DESCRICAO_HEADER_INDEX),
      category: getSafeValue(CATEGORIA_HEADER_INDEX),
      weight: getSafeFloat(PESO_KG_HEADER_INDEX),
      volume: getSafeFloat(VOLUME_M3_HEADER_INDEX),
      dimensions: getSafeValue(DIMENSOES_CM_HEADER_INDEX),
      barcode: getSafeValue(EAN_HEADER_INDEX),
      packaging: getSafeValue(EMBALAGEM_HEADER_INDEX) as 'UNIDADE' | 'MASTER',
      classification: getSafeValue(CURVA_ABC_HEADER_INDEX) as 'A' | 'B' | 'C',
    };
  }).filter(p => p.sku && p.sku.length > 0);
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
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        console.warn(`Warning: Could not load file for unit ${unit}. It may not exist yet.`);
    } else {
        console.error(`Error loading or parsing file for unit ${unit}:`, error);
    }
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
