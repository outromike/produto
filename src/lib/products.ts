import { Product } from '@/types';
import { getDbConnection, setupDatabase } from './db';
import { RowDataPacket } from 'mysql2';
import path from 'path';
import { promises as fs } from 'fs';


async function mapRowToProduct(row: RowDataPacket): Promise<Product> {
  return {
    sku: row.sku,
    item: row.item,
    description: row.description,
    category: row.category,
    netWeight: parseFloat(row.netWeight),
    grossWeight: parseFloat(row.grossWeight),
    volume: parseFloat(row.volume),
    dimensions: row.dimensions,
    palletization: {
      height: row.palletizationHeight,
      base: row.palletizationBase,
    },
    barcode: row.barcode,
    packaging: row.packaging,
    measurementUnit: row.measurementUnit,
    quantity: row.quantity,
    classification: row.classification,
    unit: row.unit,
  };
}

export async function getProducts(): Promise<Product[]> {
  const db = await getDbConnection();
  if (!db) {
    // Fallback para o arquivo JSON se o banco de dados não estiver conectado
    console.warn("Database not connected, falling back to products.json.");
    const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
    try {
      const jsonData = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(jsonData);
    } catch (error) {
      console.error("Error reading products.json:", error);
      return []; // Retorna vazio se o arquivo JSON também falhar
    }
  }

  try {
    await setupDatabase(); // Garante que as tabelas existam
    const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM products ORDER BY description ASC');
    return Promise.all(rows.map(mapRowToProduct));
  } catch (error) {
    console.error("Error fetching products from database:", error);
    // Em caso de erro, retorna um array vazio para não quebrar a aplicação
    return [];
  }
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const db = await getDbConnection();
  if (!db) {
     // Fallback para o arquivo JSON se o banco de dados não estiver conectado
    console.warn(`Database not connected, falling back to products.json for SKU: ${sku}.`);
    const allProducts = await getProducts();
    return allProducts.find(p => p.sku === sku);
  }
  
  try {
    await setupDatabase(); // Garante que as tabelas existam
    const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM products WHERE sku = ?', [sku]);

    if (rows.length > 0) {
      return mapRowToProduct(rows[0]);
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching product with SKU ${sku}:`, error);
    return undefined;
  }
}
