import { Product } from '@/types';
import { getDbConnection, setupDatabase } from './db';
import { RowDataPacket } from 'mysql2';

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
    // Se não houver conexão com o banco, retorne uma lista vazia.
    console.warn("Database not connected, returning empty product list.");
    return [];
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
    console.warn(`Database not connected, cannot fetch SKU: ${sku}.`);
    return undefined;
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
