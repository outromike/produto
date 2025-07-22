import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types';

function parseCSV(csv: string): Omit<Product, 'unit'>[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  
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
    const values = line.split(',');
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
  });
}

async function loadProductsForUnit(unit: 'ITJ' | 'JVL'): Promise<Product[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', `Cad_${unit}.csv`);
  const csvData = await fs.readFile(filePath, 'utf-8');
  const parsedData = parseCSV(csvData);
  return parsedData.map((p) => ({ ...p, unit }));
}

let allProducts: Product[] | null = null;

export async function getProducts(): Promise<Product[]> {
  if (allProducts) {
    return allProducts;
  }
  
  const [itjProducts, jvlProducts] = await Promise.all([
    loadProductsForUnit('ITJ'),
    loadProductsForUnit('JVL'),
  ]);

  allProducts = [...itjProducts, ...jvlProducts];
  return allProducts;
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.sku === sku);
}
