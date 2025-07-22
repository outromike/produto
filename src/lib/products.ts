import { Product } from '@/types';
import productsData from '@/data/products.json';

// Os dados agora são importados diretamente do arquivo JSON.
const allProducts: Product[] = productsData as Product[];

export async function getProducts(): Promise<Product[]> {
  // Retorna os produtos importados.
  return allProducts;
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.sku === sku);
}
